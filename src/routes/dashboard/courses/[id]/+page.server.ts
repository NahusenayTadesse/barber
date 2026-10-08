import { db } from '$lib/server/db';
import {
	courses as products,
	coursePaymentMethods,
	enrolments,
	paymentMethods,
	pricingOptions
} from '$lib/server/db/schema';
import { methodItems, setCourseMethods } from '$lib/server/paymentMethods';
import { message, superValidate } from 'sveltekit-superforms';

import { setFlash } from 'sveltekit-flash-message/server';

import { zod4 } from 'sveltekit-superforms/adapters';
import { edit } from './schema';
import { asc, count, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const course = await db
		.select({
			id: products.id,
			name: products.name,
			basePrice: products.basePrice,
			level: products.level,
			target: products.target,
			minPrice: products.minPrice,
			minPriceMessage: products.minPriceMessage,
			experience: products.experience,
			duration: products.duration,
			description: products.description,
			status: products.isActive,
			createdAt: products.createdAt
		})
		.from(products)
		.where(eq(products.id, Number(id)))
		.limit(1)
		.then((rows) => rows[0]);

	if (!course) {
		error(404, 'Course Not found');
	}

	const offered = await db
		.select({ id: paymentMethods.id, name: paymentMethods.name })
		.from(coursePaymentMethods)
		.innerJoin(paymentMethods, eq(paymentMethods.id, coursePaymentMethods.methodId))
		.where(eq(coursePaymentMethods.courseId, course.id))
		.orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.id));

	const form = await superValidate(
		{ ...course, methodIds: offered.map((m) => String(m.id)) },
		zod4(edit)
	);

	// Then filter in memory

	return {
		form,
		course,
		methodItems: await methodItems(),
		methodNames: offered.map((m) => m.name).join(', ')
	};
};

export const actions: Actions = {
	edit: async ({ request, locals, params }) => {
		const { id } = params;
		const form = await superValidate(request, zod4(edit));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			return message(form, { type: 'error', text: 'Please check your form data.' });
		}

		const {
			name,
			level,
			duration,
			basePrice,
			description,
			minPrice,
			minPriceMessage,
			target,
			experience,
			status,
			methodIds
		} = form.data;

		try {
			await db.transaction(async (tx) => {
				// 1. Upload images first (usually done before the DB transaction starts
				// to avoid keeping a DB connection open during slow network I/O)

				// 2. Insert the main product
				await tx
					.update(products)
					.set({
						name,
						level,
						duration,
						basePrice: String(basePrice),
						description,
						minPrice: String(minPrice),
						minPriceMessage,
						target,
						experience,
						isActive: status,
						updatedBy: locals.user.id
					})
					.where(eq(products.id, Number(id)));
				await setCourseMethods(tx, Number(id), methodIds);
			});

			return message(form, { type: 'success', text: 'Course updated successfully' });
		} catch (err) {
			console.error(err);

			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while updating the course.'
				},
				{ status: 500 }
			);
		}
	},
	delete: async ({ cookies, params }) => {
		const id = Number(params.id);

		if (!id) {
			setFlash({ type: 'error', message: 'Course not found.' }, cookies);
			return fail(404);
		}

		try {
			// Enrolments are student records, so a course that has any can't be deleted
			const [{ total }] = await db
				.select({ total: count() })
				.from(enrolments)
				.where(eq(enrolments.courseId, id));

			if (total > 0) {
				setFlash(
					{
						type: 'error',
						message: `This course has ${total} enrolment${total === 1 ? '' : 's'}, so it can't be deleted. Set it to Inactive instead to hide it from the website.`
					},
					cookies
				);
				return fail(409);
			}

			await db.transaction(async (tx) => {
				await tx.delete(pricingOptions).where(eq(pricingOptions.courseId, id));
				await tx.delete(products).where(eq(products.id, id));
			});

			setFlash({ type: 'success', message: 'Course Deleted Successfully!' }, cookies);
		} catch (err) {
			console.error('Error deleting course:', err);
			setFlash({ type: 'error', message: 'Error while deleting the course.' }, cookies);
			return fail(500);
		}
	}
};
