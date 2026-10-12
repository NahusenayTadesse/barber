import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { paidWithLabel } from '$lib/paymentWays';
import { courses, enrolments, paymentWays } from '$lib/server/db/schema';
import { mailConfigured, sendMail, welcomeEmail } from '$lib/server/mail';

/** Email a student the welcome email for their enrolment. Returns the address it went to. */
export async function sendWelcomeEmail(enrolmentId: number): Promise<string> {
	if (!mailConfigured()) throw new Error('SMTP is not configured');

	const e = await db
		.select({
			id: enrolments.id,
			firstName: enrolments.firstName,
			email: enrolments.email,
			course: enrolments.course,
			courseName: courses.name,
			duration: courses.duration,
			paymentOption: enrolments.paymentOption,
			amount: enrolments.amount,
			paymentWaySlug: paymentWays.slug,
			paymentWayName: paymentWays.name
		})
		.from(enrolments)
		.leftJoin(courses, eq(enrolments.courseId, courses.id))
		.leftJoin(paymentWays, eq(enrolments.paymentWayId, paymentWays.id))
		.where(eq(enrolments.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!e) throw new Error(`Enrolment ${enrolmentId} not found`);

	await sendMail({
		to: e.email,
		...welcomeEmail({
			firstName: e.firstName,
			courseName: e.courseName ?? e.course ?? 'your course',
			duration: e.duration,
			paymentOption: e.paymentOption,
			amountPaid: e.amount === null ? null : Number(e.amount),
			paidWith: paidWithLabel(
				e.paymentWaySlug && e.paymentWayName
					? { slug: e.paymentWaySlug, name: e.paymentWayName }
					: null
			),
			reference: e.id
		})
	});
	return e.email;
}

/** Send the welcome email without letting a mail failure break the caller. */
export async function trySendWelcomeEmail(enrolmentId: number) {
	try {
		await sendWelcomeEmail(enrolmentId);
	} catch (err) {
		console.error(
			`Error sending welcome email for enrolment ${enrolmentId}:`,
			err instanceof Error ? err.message : err
		);
	}
}
