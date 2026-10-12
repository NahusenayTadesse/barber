import { asc, eq, ne } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { paymentWays } from '$lib/server/db/schema';
import { STRIPE_WAY, type ManualPaymentWay } from '$lib/paymentWays';

/** The ways staff can record a payment in: everything except Stripe. */
export async function manualPaymentWays(): Promise<ManualPaymentWay[]> {
	const rows = await db
		.select({ id: paymentWays.id, name: paymentWays.name })
		.from(paymentWays)
		.where(ne(paymentWays.slug, STRIPE_WAY))
		.orderBy(asc(paymentWays.sortOrder), asc(paymentWays.id));
	return rows.map((w) => ({ value: String(w.id), name: w.name }));
}

/** A payment way staff may record, by id; undefined for Stripe or an unknown id. */
export async function manualPaymentWay(id: number) {
	const way = await db
		.select({ id: paymentWays.id, name: paymentWays.name, slug: paymentWays.slug })
		.from(paymentWays)
		.where(eq(paymentWays.id, id))
		.then((rows) => rows[0]);
	return way && way.slug !== STRIPE_WAY ? way : undefined;
}
