import Stripe from 'stripe';
import { and, eq, ne, sql } from 'drizzle-orm';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { enrolmentPayments, enrolments, paymentWays } from '$lib/server/db/schema';
import { STRIPE_WAY } from '$lib/paymentWays';
import { trySendWelcomeEmail } from '$lib/server/welcome';
import { trySendClassPickerEmail } from '$lib/server/classPicker';
import { tryNotifyAdmins } from '$lib/server/adminNotify';

export const stripe = new Stripe(STRIPE_SECRET_KEY);

/** Checkout sessions for a further payment by an enrolled student (e.g. an instalment) */
export const BALANCE_PAYMENT = 'balance';

const stripeWayId = sql`(SELECT ${paymentWays.id} FROM ${paymentWays} WHERE ${paymentWays.slug} = ${STRIPE_WAY})`;

/** The UK calendar date a Checkout session was paid on (roughly: when it was created) */
const paidOn = (session: Stripe.Checkout.Session) =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(
		new Date((session.created ?? Date.now() / 1000) * 1000)
	);

const isDuplicate = (err: unknown) => {
	const e = err as { code?: string; cause?: { code?: string } };
	return e?.code === 'ER_DUP_ENTRY' || e?.cause?.code === 'ER_DUP_ENTRY';
};

/**
 * Record a paid Checkout session for a further payment by an enrolled student
 * (their next instalment, or the balance). Returns whether it's recorded.
 * Safe to call more than once: a session is only ever recorded once.
 */
async function recordBalancePayment(session: Stripe.Checkout.Session): Promise<boolean> {
	const enrolmentId = Number(session.metadata?.enrolmentId);
	if (!enrolmentId || session.currency !== 'gbp' || !session.amount_total) {
		console.error(`Balance checkout session ${session.id} can't be recorded`);
		return false;
	}
	try {
		await db.transaction(async (tx) => {
			await tx.insert(enrolmentPayments).values({
				enrolmentId,
				amount: String(session.amount_total! / 100),
				paymentWayId: stripeWayId,
				paidOn: paidOn(session),
				stripeSessionId: session.id
			});
			// The link has been used: it stops working until staff send another
			await tx
				.update(enrolments)
				.set({ balanceLinkAmount: null })
				.where(and(eq(enrolments.id, enrolmentId), eq(enrolments.stripeSessionId, session.id)));
		});
	} catch (err) {
		if (isDuplicate(err)) return true;
		throw err;
	}
	return true;
}

/**
 * Mark the enrolment for a paid Checkout session as confirmed and welcome the
 * student. Returns whether that enrolment is now paid. Safe to call more than once.
 */
export async function confirmEnrolment(session: Stripe.Checkout.Session): Promise<boolean> {
	if (session.payment_status !== 'paid') return false;
	if (session.metadata?.purpose === BALANCE_PAYMENT) return recordBalancePayment(session);

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

	const result = await db.transaction(async (tx) => {
		const [result] = await tx
			.update(enrolments)
			.set({
				status: 'confirmed',
				// Paid through Stripe: staff can't change how or whether this was paid
				paymentWayId: stripeWayId,
				balanceLinkAmount: null
			})
			.where(
				and(
					eq(enrolments.id, enrolment.id),
					eq(enrolments.stripeSessionId, session.id),
					ne(enrolments.status, 'confirmed')
				)
			);
		// Kept in the student's payment history
		if (result.affectedRows > 0) {
			await tx.insert(enrolmentPayments).values({
				enrolmentId: enrolment.id,
				amount: String(session.amount_total! / 100),
				paymentWayId: stripeWayId,
				paidOn: paidOn(session),
				stripeSessionId: session.id
			});
		}
		return result;
	});

	// Only the call that actually confirmed it sends the emails, so the webhook
	// and the success page never both send them. The class link (if the course
	// has classes to choose from) follows the welcome email.
	if (result.affectedRows > 0) {
		await Promise.all([
			trySendWelcomeEmail(enrolment.id).then(() => trySendClassPickerEmail(enrolment.id)),
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

/**
 * Stop a student's open Checkout session from being paid, e.g. before their
 * payment changes. Returns true if it had already been paid (and is now recorded).
 * Throws if Stripe can't be reached.
 */
export async function closeCheckout(sessionId: string): Promise<boolean> {
	let session = await stripe.checkout.sessions.retrieve(sessionId);
	if (session.status === 'open') session = await stripe.checkout.sessions.expire(session.id);
	return session.status === 'complete' && (await confirmEnrolment(session));
}
