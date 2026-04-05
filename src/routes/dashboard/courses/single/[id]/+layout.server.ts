import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { edit, adjust, damaged, editGallery } from './schema';

import { db } from '$lib/server/db';
import { courses as products, pricingOptions as prices } from '$lib/server/db/schema';
import { eq, and, sql, isNotNull, desc, min } from 'drizzle-orm';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ params, locals }) => {
	const { id } = params;
	const form = await superValidate(zod4(edit));

	const product = await db
		.select({
			id: products.id,
			name: products.name,
			basePrice: products.basePrice,
			level: products.level,
			duration: products.duration,
			description: products.description
		})
		.from(products)
		.where(eq(products.id, Number(id)))
		.then((rows) => rows[0]);

	const priceList = await db
		.select({
			amount: prices.type,
			price: sql<number>`CAST(${prices.amount} AS DOUBLE)`
		})
		.from(prices)
		.where(eq(prices.courseId, Number(id)));

	return {
		product,
		form
	};
};
