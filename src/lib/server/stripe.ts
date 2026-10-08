import Stripe from 'stripe';
import { and, eq } from 'drizzle-orm';
import { STRIPE_SECRET_KEY } from '$env/static/private';
import { db } from '$lib/server/db';
import { enrolments } from '$lib/server/db/schema';

export const stripe = new Stripe(STRIPE_SECRET_KEY);

/** Mark the enrolment for a Checkout session as paid. Safe to call more than once. */
export async function confirmEnrolment(session: Stripe.Checkout.Session): Promise<boolean> {
	if (session.payment_status !== 'paid') return false;
	await db
		.update(enrolments)
		.set({ status: 'confirmed' })
		.where(eq(enrolments.stripeSessionId, session.id));
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
