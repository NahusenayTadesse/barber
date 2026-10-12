import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import {
	mailConfigured,
	paymentStatusAdminEmail,
	paymentStatusEmail,
	sendMail
} from '$lib/server/mail';
import { notificationRecipients } from '$lib/server/adminNotify';
import { payLinkFor } from '$lib/server/payLink';

type Status = 'pending' | 'confirmed' | 'cancelled';
const statusLabels: Record<Status, string> = {
	pending: 'Unpaid',
	confirmed: 'Paid',
	cancelled: 'Cancelled'
};

/**
 * Tell the student and staff that staff marked an enrolment unpaid or cancelled
 * (being marked paid sends the welcome and new-enrolment emails instead).
 * Each email is sent separately, so one failure doesn't stop the rest. Never throws.
 */
export async function tryNotifyStatusChange(
	enrolmentId: number,
	o: { from: Status; to: 'pending' | 'cancelled'; by: string; origin: string }
) {
	try {
		if (!mailConfigured()) throw new Error('SMTP is not configured');

		const e = await db
			.select({
				id: enrolments.id,
				firstName: enrolments.firstName,
				lastName: enrolments.lastName,
				email: enrolments.email,
				amount: enrolments.amount,
				course: enrolments.course,
				courseName: courses.name
			})
			.from(enrolments)
			.leftJoin(courses, eq(enrolments.courseId, courses.id))
			.where(eq(enrolments.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!e) throw new Error(`Enrolment ${enrolmentId} not found`);

		const courseName = e.courseName ?? e.course ?? 'your course';
		const amountDue = Number(e.amount ?? 0);
		const toStudent = paymentStatusEmail({
			firstName: e.firstName,
			courseName,
			status: o.to === 'pending' ? 'unpaid' : 'cancelled',
			amountDue,
			link: o.to === 'pending' && amountDue > 0 ? payLinkFor(o.origin, e.id) : null,
			reference: e.id
		});
		const toStaff = paymentStatusAdminEmail({
			studentName: `${e.firstName} ${e.lastName}`.trim(),
			email: e.email,
			courseName,
			from: statusLabels[o.from],
			to: statusLabels[o.to],
			by: o.by,
			reference: e.id
		});

		const sends = [
			{ to: e.email, message: toStudent },
			// Replies go straight to the student
			...(await notificationRecipients()).map((to) => ({
				to,
				message: { replyTo: e.email, ...toStaff }
			}))
		];
		const results = await Promise.allSettled(
			sends.map(({ to, message }) => sendMail({ to, ...message }))
		);
		results.forEach((r, i) => {
			if (r.status === 'rejected') {
				console.error(
					`Error emailing ${sends[i].to} about enrolment ${enrolmentId}'s status:`,
					r.reason instanceof Error ? r.reason.message : r.reason
				);
			}
		});
	} catch (err) {
		console.error(
			`Error emailing about enrolment ${enrolmentId}'s status:`,
			err instanceof Error ? err.message : err
		);
	}
}
