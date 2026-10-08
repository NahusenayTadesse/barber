import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { eq } from 'drizzle-orm';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { courses, gallery } from '$lib/server/db/schema';
import { getActiveDiscounts } from '$lib/server/discounts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod4(schema));

	const allCourses = await db.select().from(courses).where(eq(courses.isActive, true));
	const discounts = await getActiveDiscounts(allCourses.map((c) => c.id));
	const coursesList = allCourses.map((c) => ({ ...c, discount: discounts[c.id] ?? null }));

	const images = await db.select().from(gallery);

	const imagesList = images.map((img) => img.imageUrl);

	if (coursesList[0]) {
		form.data.courseId = coursesList[0].id;
	}

	return {
		form,
		coursesList,
		imagesList
	};
};
