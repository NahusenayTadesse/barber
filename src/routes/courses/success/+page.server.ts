import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { enrolments } from '$lib/server/db/schema';
import { confirmEnrolment, stripe } from '$lib/server/stripe';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const sessionId = url.searchParams.get('session_id');
	if (!sessionId) redirect(303, '/courses');

	let session;
	try {
		session = await stripe.checkout.sessions.retrieve(sessionId);
	} catch {
		redirect(303, '/courses');
	}

	// The webhook normally confirms the payment; this covers it if the webhook is late or not set up
	const paid = await confirmEnrolment(session);

	const enrolment = await db
		.select({
			firstName: enrolments.firstName,
			course: enrolments.course,
			amount: enrolments.amount
		})
		.from(enrolments)
		.where(eq(enrolments.stripeSessionId, session.id))
		.then((rows) => rows[0]);

	return {
		paid,
		firstName: enrolment?.firstName ?? '',
		course: enrolment?.course ?? '',
		amount: enrolment?.amount ?? null,
		email: session.customer_details?.email ?? session.customer_email ?? ''
	};
};
