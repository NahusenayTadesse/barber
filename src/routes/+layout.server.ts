import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(async (event) => {

  	const coursesList = await db.select().from(courses);

  return {courses: coursesList};
});