import { error, fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	courses,
	discountNullifications,
	enrolmentPayments,
	enrolments
} from '$lib/server/db/schema';
import { enrolmentIdFromToken } from '$lib/server/payLink';
import { BALANCE_PAYMENT, confirmEnrolment, stripe } from '$lib/server/stripe';
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
						status: enrolments.status,
						stripeSessionId: enrolments.stripeSessionId,
						totalPrice: enrolments.totalPrice,
						balanceLinkAmount: enrolments.balanceLinkAmount,
						paid: sql<string>`(SELECT COALESCE(SUM(${enrolmentPayments.amount}), 0) FROM ${enrolmentPayments} WHERE ${enrolmentPayments.enrolmentId} = ${enrolments.id})`,
						removedDiscount: discountNullifications.discountName
					})
					.from(enrolments)
					.leftJoin(courses, eq(enrolments.courseId, courses.id))
					.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, enrolments.id))
					.where(eq(enrolments.id, id))
					.then((rows) => rows[0]);
	if (!enrolment) error(404, 'This payment link is not valid');

	// An enrolled student staff have asked for a further payment, e.g. their next
	// instalment. Otherwise the link is for the payment that enrols them.
	const balanceAmount = Number(enrolment.balanceLinkAmount ?? 0);
	const balance = enrolment.status === 'confirmed' && balanceAmount > 0;
	const total = Number(enrolment.totalPrice ?? 0);
	return {
		...enrolment,
		balance,
		due: balance ? balanceAmount : Number(enrolment.amount ?? 0),
		// Left to pay after this payment, if a total is known
		leftAfter: balance && total ? Math.max(total - Number(enrolment.paid) - balanceAmount, 0) : null
	};
}

export const load: PageServerLoad = async ({ params }) => {
	const e = await enrolmentFor(params.token);
	return {
		firstName: e.firstName,
		course: e.courseName ?? e.course ?? 'your course',
		paymentOption: e.paymentOption ?? '',
		amount: e.due,
		status: e.status,
		// A further payment by an enrolled student, and what they'll owe after it
		balance: e.balance,
		leftAfter: e.leftAfter,
		// Set when a discount was taken off and this is the balance left to pay
		removedDiscount: e.removedDiscount
	};
};

export const actions: Actions = {
	pay: async ({ params, url }) => {
		const e = await enrolmentFor(params.token);
		const amount = e.due;
		if ((e.status !== 'pending' && !e.balance) || amount <= 0) {
			return fail(400, { message: 'This enrolment has nothing left to pay.' });
		}

		// Only one checkout can be payable at a time: a second open one (another tab,
		// the back button) could also be paid, and only the latest is linked here
		if (e.stripeSessionId) {
			let previous;
			try {
				previous = await stripe.checkout.sessions.retrieve(e.stripeSessionId);
				if (previous.status === 'open') {
					previous = await stripe.checkout.sessions.expire(previous.id);
				}
			} catch (err) {
				console.error(
					'Pay link: previous checkout check failed:',
					err instanceof Error ? err.message : err
				);
				return fail(500, {
					message: "We couldn't start the payment. Please try again, or call us on 020 3700 3997."
				});
			}
			// An enrolled student's first checkout was paid long ago; only a further
			// payment just made in another tab matters here
			const previousIsBalance = previous.metadata?.purpose === BALANCE_PAYMENT;
			if (previous.status === 'complete' && (!e.balance || previousIsBalance)) {
				// Already paid in another tab
				if (await confirmEnrolment(previous)) {
					redirect(303, `/courses/success?session_id=${previous.id}`);
				}
				return fail(400, {
					message: 'Your last payment is still being processed. Please check back shortly.'
				});
			}
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
					source: 'pay-link',
					...(e.balance && { purpose: BALANCE_PAYMENT })
				},
				line_items: [
					{
						price_data: {
							currency: 'gbp',
							product_data: {
								name: [courseName, e.balance ? 'Further payment' : e.paymentOption]
									.filter(Boolean)
									.join(' — ')
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
