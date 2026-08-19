import { db } from '$lib/server/db';
import { services, gallery } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const servicesList = await db.select().from(services);
	const images = await db.select().from(gallery);
	const imagesList = images.map((img) => img.imageUrl);

	return {
		servicesList,
		imagesList
	};
};
