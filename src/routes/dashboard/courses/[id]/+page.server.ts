import { db } from '$lib/server/db';
import { courses as products } from '$lib/server/db/schema';
import { message, superValidate } from 'sveltekit-superforms';

import { setFlash } from 'sveltekit-flash-message/server';

import { zod4 } from 'sveltekit-superforms/adapters';
import { edit } from './schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from '../$types';
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

	const form = await superValidate(course, zod4(edit));

	// Then filter in memory

	return {
		form,
		course
	};
};

export const actions: Actions = {
	edit: async ({ request, locals, params }) => {
		const { id } = params;
		const form = await superValidate(request, zod4(edit));

		console.log(form);

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
			status
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
			});

			return message(form, { type: 'success', text: 'Course updated successfully' });
		} catch (err) {
			console.error(err);

			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while updating the course.' + err?.message
				},
				{ status: 500 }
			);
		}
	},
	delete: async ({ cookies, params }) => {
		const { id } = params;

		try {
			if (!id) {
				setFlash({ type: 'error', text: `Unexpected Error: Course Not Found` }, cookies);
			}

			await db.transaction(async (tx) => {
				await tx.delete(products).where(eq(products.id, id));
			});

			setFlash({ type: 'success', text: 'Course Deleted Successfully!' }, cookies);
		} catch (err) {
			console.error('Error deleting course:', err);
			return fail(400, { type: 'error', text: `Unexpected Error: ${err?.message}` });
		}
	}
};
