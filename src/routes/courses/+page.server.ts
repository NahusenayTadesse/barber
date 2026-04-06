import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { contactSchema } from './schema';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(contactSchema));

	const coursesList = await db.select().from(courses);

	return {
		form,
		coursesList
	};
};

export const actions: Actions = {
	enroll: async ({ request }) => {
		const form = await superValidate(request, zod4(contactSchema));
		console.log(form);
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { firstName, lastName, phone, email, courseId, paymentOption } = form.data;

		try {
			await db.insert(enrolments).values({ name, phone, email, subject, courseId, paymentOption });

			return message(form, { type: 'success', text: 'Message Successfully Sent!' });
		} catch (err) {
			return message(form, {
				type: 'error',
				text: 'Error Adding Messages: ' + err?.message
			});
		}
	}
};
