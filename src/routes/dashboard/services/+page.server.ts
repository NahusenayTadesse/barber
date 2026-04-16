import { setError, superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';

import { add as schema, edit as editSchema, deleteService } from './schema.js';
import { db } from '$lib/server/db';
import { contactMessages as paymentMethods, services, user } from '$lib/server/db/schema';
import type { Actions } from './$types.js';
import type { PageServerLoad } from './$types.js';
import { saveUploadedFile } from '$lib/server/upload.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));
	const editForm = await superValidate(zod4(editSchema));
	const deleteForm = await superValidate(zod4(deleteService));

	const allPaymentMethods = await db
		.select({
			id: services.id,
			name: services.name,
			price: services.price,
			description: services.description,
			imageUrl: services.imageUrl,
			bookingLink: services.bookingLink
		})
		.from(services);

	return {
		form,
		editForm,
		deleteForm,
		allPaymentMethods
	};
};

export const actions: Actions = {
	add: async ({ request }) => {
		const form = await superValidate(request, zod4(schema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please fix the errors in the form.' },
				{ status: 400 }
			);
		}

		const { name, price, description, bookingLink, imageUrl } = form.data;

		const avatarFile = await saveUploadedFile(imageUrl);

		try {
			await db.insert(services).values({
				name,
				price,
				description,
				bookingLink,
				imageUrl: avatarFile
			});

			return message(form, { type: 'success', text: 'Service Successfully Created' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while creating Service.'
				},
				{ status: 500 }
			);
		}
	},
	edit: async ({ request }) => {
		const form = await superValidate(request, zod4(editSchema));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please fix the errors in the form.' },
				{ status: 400 }
			);
		}

		const { id, name, price, description, bookingLink, imageUrl } = form.data;

		try {
			if (imageUrl) {
				const avatarFile = await saveUploadedFile(imageUrl);
				await db
					.update(services)
					.set({
						name,
						price: String(price),
						description,
						bookingLink,
						imageUrl: avatarFile
					})
					.where(eq(services.id, id));
			} else {
				await db
					.update(services)
					.set({
						name,
						price: String(price),
						description,
						bookingLink
					})
					.where(eq(services.id, id));
			}
			return message(form, { type: 'success', text: 'Service Successfully Updated' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while updating Service.'
				},
				{ status: 500 }
			);
		}
	},
	delete: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(deleteService));

		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please fix the errors in the form.' },
				{ status: 400 }
			);
		}

		const { id } = form.data;

		try {
			await db.delete(services).where(eq(services.id, id));
			return message(form, { type: 'success', text: 'Service Successfully Deleted' });
		} catch (err: any) {
			return message(
				form,
				{
					type: 'error',
					text: 'Error while deleting Service.'
				},
				{ status: 500 }
			);
		}
	}
};
