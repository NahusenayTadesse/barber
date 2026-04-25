import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';

import { redirect } from 'sveltekit-flash-message/server';

import { STRIPE_SECRET_KEY } from '$env/static/private';
import Stripe from 'stripe';
import { ORIGIN } from '$env/static/public';
const stripe = new Stripe(STRIPE_SECRET_KEY);

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
	enroll: async ({ request, cookies, url }) => {
		const form = await superValidate(request, zod4(schema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { firstName, lastName, phone, email, courseId, paymentOption, paymentAmount } = form.data;

		const siteOrigin = url.origin;

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price_data: {
						currency: 'gbp',
						product_data: {
							name: 'Service Fee'
						},
						unit_amount: paymentAmount * 100
					},
					quantity: 1
				}
			],
			mode: 'payment',

			success_url: `${siteOrigin}/courses`,
			cancel_url: `${siteOrigin}/courses`
		});

		console.log(session);

		if (session.url) {
			const enrolment = await db
				.insert(enrolments)
				.values({ firstName, lastName, phone, email, courseId, paymentOption })
				.$returningId();

			if (!enrolment) {
				return message(
					form,
					{
						type: 'error',
						text: 'Error Adding Enrolment'
					},
					{
						status: 500
					}
				);
			}
			redirect(
				303,
				session.url,
				{ type: 'success', message: 'Enrolment Successfully Applied!' },
				cookies
			);
		} else {
			return message(
				form,
				{
					type: 'error',
					text: 'Error Creating Checkout Session'
				},
				{
					status: 500
				}
			);
		}
	}
};
