import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));

	const coursesList = await db.select().from(courses);

	form.data.courseId = coursesList[0].id;

	return {
		form,
		coursesList
	};
};

export const actions: Actions = {
	enroll: async ({ request }) => {
		const form = await superValidate(request, zod4(schema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { firstName, lastName, phone, email, courseId, paymentOption } = form.data;

		try {
			await db
				.insert(enrolments)
				.values({ firstName, lastName, phone, email, courseId, paymentOption });

			return message(form, { type: 'success', text: 'Enrolment Successfully Applied!' });
		} catch (err) {
			console.error(err.message);
			return message(form, {
				type: 'error',
				text: 'Error Adding Enrolment'
			});
		}
	}
};
