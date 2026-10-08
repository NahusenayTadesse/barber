import { auth } from '$lib/server/auth';
import { redirect } from 'sveltekit-flash-message/server';

import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import {
	enrolments,
	contactMessages,
	certificates,
	courses,
	coursePaymentMethods,
	courseDiscounts,
	paymentMethods
} from '$lib/server/db/schema';
import { and, eq, gt, gte, isNull, lte, sql } from 'drizzle-orm';

const count = sql<number>`count(*)`;
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

	const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const now = new Date();

	const [unpaid, paidWithoutCertificate, coursesWithoutMethods, recentMessages, totals] =
		await Promise.all([
			// Registered or started checkout, but not paid yet
			db
				.select({ count })
				.from(enrolments)
				.where(and(eq(enrolments.status, 'pending'), gt(enrolments.amount, '0'))),

			// Paid students with no valid certificate yet
			db
				.select({ count })
				.from(enrolments)
				.leftJoin(
					certificates,
					and(eq(certificates.enrolmentId, enrolments.id), eq(certificates.isActive, true))
				)
				.where(and(eq(enrolments.status, 'confirmed'), isNull(certificates.id))),

			// Active courses students can't pay for online
			db
				.select({ id: courses.id, name: courses.name })
				.from(courses)
				.leftJoin(coursePaymentMethods, eq(coursePaymentMethods.courseId, courses.id))
				.leftJoin(
					paymentMethods,
					and(
						eq(paymentMethods.id, coursePaymentMethods.methodId),
						eq(paymentMethods.isActive, true)
					)
				)
				.where(eq(courses.isActive, true))
				.groupBy(courses.id, courses.name)
				.having(sql`count(${paymentMethods.id}) = 0`),

			db.select({ count }).from(contactMessages).where(gte(contactMessages.createdAt, weekAgo)),

			Promise.all([
				db.select({ count }).from(enrolments).where(eq(enrolments.status, 'confirmed')),
				db.select({ count }).from(certificates).where(eq(certificates.isActive, true)),
				db
					.select({ count })
					.from(courseDiscounts)
					.where(
						and(
							eq(courseDiscounts.isActive, true),
							lte(courseDiscounts.startsAt, now),
							gt(courseDiscounts.expiresAt, now)
						)
					)
			])
		]);

	const [paidStudents, validCertificates, liveDiscounts] = totals;

	return {
		enrolmentResult,
		messageResult,
		attention: {
			unpaid: Number(unpaid[0]?.count ?? 0),
			paidWithoutCertificate: Number(paidWithoutCertificate[0]?.count ?? 0),
			coursesWithoutMethods,
			recentMessages: Number(recentMessages[0]?.count ?? 0)
		},
		totals: {
			paidStudents: Number(paidStudents[0]?.count ?? 0),
			certificates: Number(validCertificates[0]?.count ?? 0),
			liveDiscounts: Number(liveDiscounts[0]?.count ?? 0)
		}
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
