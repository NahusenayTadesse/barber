import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import { enrolmentIdFromToken } from '$lib/server/payLink';
import { stripe } from '$lib/server/stripe';
import type { Actions, PageServerLoad } from './$types';

/** The registration a payment link points to, or a 404 for a wrong or edited link. */
async function enrolmentFor(token: string) {
	const id = enrolmentIdFromToken(token);
	const enrolment =
		id === null
			? undefined
			: await db
					.select({
						id: enrolments.id,
						firstName: enrolments.firstName,
						lastName: enrolments.lastName,
						email: enrolments.email,
						courseId: enrolments.courseId,
						course: enrolments.course,
						courseName: courses.name,
						paymentOption: enrolments.paymentOption,
						amount: enrolments.amount,
						status: enrolments.status
					})
					.from(enrolments)
					.leftJoin(courses, eq(enrolments.courseId, courses.id))
					.where(eq(enrolments.id, id))
					.then((rows) => rows[0]);
	if (!enrolment) error(404, 'This payment link is not valid');
	return enrolment;
}

export const load: PageServerLoad = async ({ params }) => {
	const e = await enrolmentFor(params.token);
	return {
		firstName: e.firstName,
		course: e.courseName ?? e.course ?? 'your course',
		paymentOption: e.paymentOption ?? '',
		amount: Number(e.amount ?? 0),
		status: e.status
	};
};

export const actions: Actions = {
	pay: async ({ params, url }) => {
		const e = await enrolmentFor(params.token);
		const amount = Number(e.amount ?? 0);
		if (e.status !== 'pending' || amount <= 0) {
			return fail(400, { message: 'This enrolment has nothing left to pay.' });
		}

		let checkoutUrl: string | null = null;
		try {
			const courseName = e.courseName ?? e.course ?? 'Course';
			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				customer_email: e.email,
				client_reference_id: String(e.id),
				metadata: {
					enrolmentId: String(e.id),
					courseId: String(e.courseId ?? ''),
					paymentOption: e.paymentOption ?? '',
					source: 'pay-link'
				},
				line_items: [
					{
						price_data: {
							currency: 'gbp',
							product_data: {
								name: [courseName, e.paymentOption].filter(Boolean).join(' — ')
							},
							unit_amount: Math.round(amount * 100)
						},
						quantity: 1
					}
				],
				success_url: `${url.origin}/courses/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url.origin}/pay/${params.token}?cancelled=1`
			});

			// A newer checkout replaces any earlier one the student abandoned
			await db
				.update(enrolments)
				.set({ stripeSessionId: session.id })
				.where(eq(enrolments.id, e.id));
			checkoutUrl = session.url;
		} catch (err) {
			console.error('Pay link checkout failed:', err instanceof Error ? err.message : err);
		}

		if (!checkoutUrl) {
			return fail(500, {
				message: "We couldn't start the payment. Please try again, or call us on 020 3700 3997."
			});
		}
		redirect(303, checkoutUrl);
	}
};
