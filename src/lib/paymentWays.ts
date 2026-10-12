// Shared (client + server) helpers for how a student paid.

/** Slug of the Stripe payment way: set automatically, never chosen by staff. */
export const STRIPE_WAY = 'stripe';

/** A way staff can record a payment in (Bank Transfer, Cash...). */
export type ManualPaymentWay = { value: string; name: string };

/** How a payment way reads in emails: Stripe is a card payment to the student. */
export const paidWithLabel = (way: { slug: string; name: string } | null | undefined) =>
	way ? (way.slug === STRIPE_WAY ? 'Card (Stripe)' : way.name) : null;
