import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { cancelEnrolment, confirmEnrolment, stripe } from '$lib/server/stripe';
import type { RequestHandler } from './$types';

/**
 * Stripe webhook: the reliable way to learn a Checkout payment succeeded, even
 * if the customer closes the tab before reaching the success page.
 * Needs STRIPE_WEBHOOK_SECRET (from the Stripe dashboard, or `stripe listen`).
 */
export const POST: RequestHandler = async ({ request }) => {
	const secret = env.STRIPE_WEBHOOK_SECRET;
	if (!secret) {
		console.error('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not set');
		error(500, 'Webhook not configured');
	}

	let event;
	try {
		event = stripe.webhooks.constructEvent(
			await request.text(),
			request.headers.get('stripe-signature') ?? '',
			secret
		);
	} catch {
		error(400, 'Invalid signature');
	}

	switch (event.type) {
		case 'checkout.session.completed':
		case 'checkout.session.async_payment_succeeded':
			await confirmEnrolment(event.data.object);
			break;
		case 'checkout.session.expired':
		case 'checkout.session.async_payment_failed':
			await cancelEnrolment(event.data.object);
			break;
	}

	return json({ received: true });
};
