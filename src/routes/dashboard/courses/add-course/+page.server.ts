import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { add } from './schema';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { methodItems, setCourseMethods } from '$lib/server/paymentMethods';

export const load: PageServerLoad = async () => {
	const items = await methodItems();
	// New courses offer every enabled method unless unticked
	const form = await superValidate(
		{ methodIds: items.filter((m) => m.isActive).map((m) => m.value) },
		zod4(add),
		{ errors: false }
	);

	return {
		form,
		methodItems: items
	};
};

export const actions: Actions = {
	add: async ({ request, cookies, locals }) => {
		const form = await superValidate(request, zod4(add));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form data.' }, cookies);
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
			methodIds
		} = form.data;

		try {
			await db.transaction(async (tx) => {
				// 1. Upload images first (usually done before the DB transaction starts
				// to avoid keeping a DB connection open during slow network I/O)

				// 2. Insert the main product
				const [{ id }] = await tx
					.insert(courses)
					.values({
						name,
						level,
						duration,
						basePrice,
						description,
						minPrice,
						minPriceMessage,
						target,
						experience
					})
					.$returningId();
				await setCourseMethods(tx, id, methodIds);
			});

			return message(form, { type: 'success', text: 'New Course Successfully Added' });
		} catch (err) {
			console.error(err);

			return message(
				form,
				{
					type: 'error',
					text: 'An error occurred while adding the course.'
				},
				{ status: 500 }
			);
		}
	}
};
