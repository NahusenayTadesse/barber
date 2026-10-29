import { asc, eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { paidWithLabel } from '$lib/paymentWays';
import { courses, enrolments, paymentWays, notificationEmails } from '$lib/server/db/schema';
import { mailConfigured, newEnrolmentAdminEmail, sendMail } from '$lib/server/mail';

/** The SMTP account, which is always told about new enrolments. */
export const alwaysNotified = () => env.SMTP_USER?.trim().toLowerCase() || null;

/** Everyone told about new enrolments: the SMTP account plus the saved addresses. */
export async function notificationRecipients(): Promise<string[]> {
	const saved = await db
		.select({ email: notificationEmails.email })
		.from(notificationEmails)
		.orderBy(asc(notificationEmails.email));
	const all = [alwaysNotified(), ...saved.map((r) => r.email.toLowerCase())];
	return [...new Set(all.filter((e): e is string => Boolean(e)))];
}

/**
 * Email staff about a newly confirmed enrolment. Each address gets its own
 * email, so one bad address doesn't stop the rest. Never throws.
 */
export async function tryNotifyAdmins(enrolmentId: number, source: string) {
	try {
		if (!mailConfigured()) throw new Error('SMTP is not configured');

		const e = await db
			.select({
				id: enrolments.id,
				firstName: enrolments.firstName,
				lastName: enrolments.lastName,
				email: enrolments.email,
				phone: enrolments.phone,
				course: enrolments.course,
				courseName: courses.name,
				paymentOption: enrolments.paymentOption,
				amount: enrolments.amount,
				paymentWaySlug: paymentWays.slug,
				paymentWayName: paymentWays.name,
				discountName: enrolments.discountName,
				discountPercentage: enrolments.discountPercentage,
				notes: enrolments.notes
			})
			.from(enrolments)
			.leftJoin(courses, eq(enrolments.courseId, courses.id))
			.leftJoin(paymentWays, eq(enrolments.paymentWayId, paymentWays.id))
			.where(eq(enrolments.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!e) throw new Error(`Enrolment ${enrolmentId} not found`);

		const message = newEnrolmentAdminEmail({
			studentName: `${e.firstName} ${e.lastName}`.trim(),
			email: e.email,
			phone: e.phone,
			courseName: e.courseName ?? e.course ?? 'Unknown course',
			paymentOption: e.paymentOption,
			amountPaid: e.amount === null ? null : Number(e.amount),
			paidWith: paidWithLabel(
				e.paymentWaySlug && e.paymentWayName
					? { slug: e.paymentWaySlug, name: e.paymentWayName }
					: null
			),
			discount: e.discountName ? `${e.discountName} (${Number(e.discountPercentage)}%)` : null,
			reference: e.id,
			source,
			notes: e.notes
		});

		const recipients = await notificationRecipients();
		const results = await Promise.allSettled(
			// Replies go straight to the student
			recipients.map((to) => sendMail({ to, replyTo: e.email, ...message }))
		);
		results.forEach((r, i) => {
			if (r.status === 'rejected') {
				console.error(
					`Error notifying ${recipients[i]} of enrolment ${enrolmentId}:`,
					r.reason instanceof Error ? r.reason.message : r.reason
				);
			}
		});
	} catch (err) {
		console.error(
			`Error notifying staff of enrolment ${enrolmentId}:`,
			err instanceof Error ? err.message : err
		);
	}
}
