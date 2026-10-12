import Stripe from 'stripe';
import { and, eq, ne, sql } from 'drizzle-orm';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { enrolments, paymentWays } from '$lib/server/db/schema';
import { STRIPE_WAY } from '$lib/paymentWays';
import { trySendWelcomeEmail } from '$lib/server/welcome';
import { tryNotifyAdmins } from '$lib/server/adminNotify';

export const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * Mark the enrolment for a paid Checkout session as confirmed and welcome the
 * student. Returns whether that enrolment is now paid. Safe to call more than once.
 */
export async function confirmEnrolment(session: Stripe.Checkout.Session): Promise<boolean> {
	if (session.payment_status !== 'paid') return false;

	const enrolment = await db
		.select({ id: enrolments.id, status: enrolments.status, amount: enrolments.amount })
		.from(enrolments)
		.where(eq(enrolments.stripeSessionId, session.id))
		.then((rows) => rows[0]);
	if (!enrolment) {
		console.error(`Paid Checkout session ${session.id} matches no enrolment`);
		return false;
	}
	if (enrolment.status === 'confirmed') return true;

	// Never confirm a payment for less than the student owes
	const owed = Math.round(Number(enrolment.amount ?? 0) * 100);
	if (session.currency !== 'gbp' || (session.amount_total ?? 0) < owed) {
		console.error(
			`Checkout session ${session.id} paid ${session.amount_total} ${session.currency}, ` +
				`but enrolment ${enrolment.id} owes ${owed} gbp: not confirmed`
		);
		return false;
	}

	const [result] = await db
		.update(enrolments)
		.set({
			status: 'confirmed',
			// Paid through Stripe: staff can't change how or whether this was paid
			paymentWayId: sql`(SELECT ${paymentWays.id} FROM ${paymentWays} WHERE ${paymentWays.slug} = ${STRIPE_WAY})`
		})
		.where(
			and(
				eq(enrolments.id, enrolment.id),
				eq(enrolments.stripeSessionId, session.id),
				ne(enrolments.status, 'confirmed')
			)
		);

	// Only the call that actually confirmed it sends the emails, so the webhook
	// and the success page never both send them
	if (result.affectedRows > 0) {
		await Promise.all([
			trySendWelcomeEmail(enrolment.id),
			tryNotifyAdmins(
				enrolment.id,
				session.metadata?.source === 'pay-link' ? 'Payment link' : 'Online checkout'
			)
		]);
	}
	return true;
}

/** Mark a still-unpaid enrolment as cancelled (its Checkout session expired or failed). */
export async function cancelEnrolment(session: Stripe.Checkout.Session): Promise<void> {
	// Students registered from the dashboard stay registered: they can pay later
	// with the same payment link
	if (session.metadata?.source === 'pay-link') return;
	await db
		.update(enrolments)
		.set({ status: 'cancelled' })
		.where(and(eq(enrolments.stripeSessionId, session.id), eq(enrolments.status, 'pending')));
}
