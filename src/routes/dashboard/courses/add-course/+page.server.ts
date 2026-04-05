import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { add } from './schema';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(add));

	return {
		form
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(add));
		console.log(form);

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form data.' }, cookies);
			return message(form, { type: 'error', text: 'Please check your form data.' });
		}

		const { name, level, duration, basePrice, description } = form.data;

		try {
			await db.transaction(async (tx) => {
				// 1. Upload images first (usually done before the DB transaction starts
				// to avoid keeping a DB connection open during slow network I/O)

				// 2. Insert the main product
				await tx.insert(courses).values({
					name,
					level,
					duration,
					basePrice,
					description
				});
			});

			return message(form, { type: 'success', text: 'New Course Successfully Added' });
		} catch (err) {
			console.error(err);

			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while adding the course.' + err?.message
				},
				{ status: 500 }
			);
		}
	}
};
