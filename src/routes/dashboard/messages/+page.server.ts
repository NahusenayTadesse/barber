import { superValidate, message, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { desc, eq } from 'drizzle-orm';

import { deleteMessage } from './schema.js';
import { db } from '$lib/server/db';
import { contactMessages } from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	const deleteForm = await superValidate(zod4(deleteMessage));

	const allPaymentMethods = await db
		.select({
			id: contactMessages.id,
			name: contactMessages.name,
			email: contactMessages.email,
			phone: contactMessages.phone,
			subject: contactMessages.subject,
			isRead: contactMessages.isRead,
			message: contactMessages.message,
			submittedAt: contactMessages.createdAt
		})
		.from(contactMessages)
		.orderBy(desc(contactMessages.createdAt));

	return {
		deleteForm,
		allPaymentMethods
	};
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const form = await superValidate(request, zod4(deleteMessage));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.delete(contactMessages).where(eq(contactMessages.id, form.data.id));
			return message(form, { type: 'success', text: 'Message Successfully Deleted' });
		} catch (err) {
			console.error('Error deleting message:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while deleting message.' },
				{ status: 500 }
			);
		}
	}
};
