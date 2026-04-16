import { eq } from 'drizzle-orm';

import { db } from '$lib/server/db';
import { services } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	const allServices = await db
		.select({
			id: services.id,
			name: services.name,
			price: services.price,
			description: services.description,
			imageUrl: services.imageUrl,
			bookingLink: services.bookingLink
		})
		.from(services);

	return {
		allServices
	};
};
