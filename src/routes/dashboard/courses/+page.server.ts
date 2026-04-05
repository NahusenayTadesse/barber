import { db } from '$lib/server/db';
import { courses as products, pricingOptions as prices } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from '../$types';
export const load: PageServerLoad = async () => {
	// First, get products
	const productsData = await db
		.select({
			id: products.id,
			name: products.name,
			basePrice: products.basePrice,
			level: products.level,
			duration: products.duration,
			description: products.description
		})
		.from(products)
		.where(eq(products.isActive, true));

	// Then, get prices for those products
	const productIds = productsData.map((p) => p.id);
	const pricesData = await db.select().from(prices);

	// Then filter in memory

	const relevantPrices = pricesData.filter((p) => productIds.includes(p.id));

	// Merge in application code
	const productList = productsData.map((p) => ({
		...p,
		priceList: relevantPrices
			.filter((price) => price.courseId === p.id)
			.map((price) => ({
				amount: price.amount + ' Pieces',
				price: '£' + price.amount
			}))
	}));

	return {
		productList
	};
};
