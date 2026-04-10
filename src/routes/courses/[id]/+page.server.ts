import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const form = await superValidate(zod4(schema));

	const course = await db
		.select({ id: courses.id, name: courses.name })
		.from(courses)
		.where(eq(courses.id, Number(id)))
		.limit(1)
		.then((res) => res[0]);

	if (!course) {
		error(404, 'Course not found');
	}

	const coursesList = await db.select().from(courses);

	form.data.courseId = Number(id);

	return {
		form,
		course,
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
