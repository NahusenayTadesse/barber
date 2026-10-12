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
import { saveUploadedFile } from '$lib/server/upload';
import { asc, count, eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail, error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const course = await db
		.select({
			id: products.id,
			name: products.name,
			audience: products.audience,
			basePrice: products.basePrice,
			level: products.level,
			target: products.target,
			minPrice: products.minPrice,
			minPriceMessage: products.minPriceMessage,
			experience: products.experience,
			duration: products.duration,
			description: products.description,
			featuredImage: products.featuredImage,
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
		// The stored image is a file name, not an upload: the form only takes a new file
		{ ...course, featuredImage: undefined, methodIds: offered.map((m) => String(m.id)) },
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
			audience,
			level,
			duration,
			basePrice,
			description,
			minPrice,
			minPriceMessage,
			target,
			experience,
			status,
			methodIds,
			featuredImage
		} = form.data;

		try {
			// Save the image before the transaction so it isn't held open during file I/O
			const featuredImageFile = featuredImage ? await saveUploadedFile(featuredImage) : null;

			await db.transaction(async (tx) => {

				// 2. Insert the main product
				await tx
					.update(products)
					.set({
						name,
						audience,
						// Empty optional fields are stored as nothing rather than ''
						level: level || null,
						duration: duration || null,
						basePrice: String(basePrice),
						description: description || null,
						minPrice: minPrice == null ? null : String(minPrice),
						minPriceMessage: minPriceMessage || null,
						target: target || null,
						experience: experience || null,
						isActive: status,
						// Only replaced when a new image was uploaded
						...(featuredImageFile && { featuredImage: featuredImageFile }),
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
