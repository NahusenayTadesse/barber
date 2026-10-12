import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { add } from './schema';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types.js';
import { setFlash } from 'sveltekit-flash-message/server';
import { methodItems, setCourseMethods } from '$lib/server/paymentMethods';
import { audienceParam } from '$lib/courses';
import { saveUploadedFile } from '$lib/server/upload';

export const load: PageServerLoad = async ({ url }) => {
	const items = await methodItems();
	// New courses offer every enabled method unless unticked
	const form = await superValidate(
		// Opened from the women's courses view (?for=women), it starts as a women's course
		{
			audience: audienceParam(url) ?? 'men',
			methodIds: items.filter((m) => m.isActive).map((m) => m.value)
		},
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
			audience,
			level,
			duration,
			basePrice,
			description,
			minPrice,
			minPriceMessage,
			target,
			experience,
			methodIds,
			featuredImage
		} = form.data;

		try {
			// Save the image before the transaction so it isn't held open during file I/O
			const featuredImageFile = featuredImage ? await saveUploadedFile(featuredImage) : null;

			await db.transaction(async (tx) => {

				// 2. Insert the main product
				const [{ id }] = await tx
					.insert(courses)
					.values({
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
						featuredImage: featuredImageFile
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
