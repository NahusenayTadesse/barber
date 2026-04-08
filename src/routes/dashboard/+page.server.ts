import { auth } from '$lib/server/auth';
import { redirect } from 'sveltekit-flash-message/server';

import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { enrolments, contactMessages } from '$lib/server/db/schema';
import { gte, sql } from 'drizzle-orm';
export const load: PageServerLoad = async () => {
	// Get the start of the current day (00:00:00)
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);

	// Run both counts in parallel for better performance
	const [enrolmentResult, messageResult] = await Promise.all([
		db
			.select({ count: sql<number>`count(*)` })
			.from(enrolments)
			.where(gte(enrolments.createdAt, startOfToday)),

		db
			.select({ count: sql<number>`count(*)` })
			.from(contactMessages)
			.where(gte(contactMessages.createdAt, startOfToday))
	]);

	return {
		enrolmentResult,
		messageResult
	};
};

export const actions: Actions = {
	logout: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		redirect('/login', { type: 'success', message: 'Logout Successful' }, event.cookies);
	}
};
