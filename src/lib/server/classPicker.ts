import { asc, eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db';
import { classSessions, classes, courses, enrolments } from '$lib/server/db/schema';
import { classPickerEmail, classScheduleEmail, mailConfigured, sendMail } from '$lib/server/mail';
import { classLinkFor } from '$lib/server/classLink';
import { openClassesFor } from '$lib/server/classes';
import { shortTime, sortSessions, weekDays } from '$lib/classes';

const siteOrigin = () => env.ORIGIN || 'https://dndbarberacademy.com';

/**
 * Email a paid student the link to choose their class, if their course has
 * classes with places left. Returns the address it went to, or null when
 * there was nothing to choose from.
 */
export async function sendClassPickerEmail(
	enrolmentId: number,
	origin = siteOrigin()
): Promise<string | null> {
	if (!mailConfigured()) throw new Error('SMTP is not configured');

	const e = await db
		.select({
			firstName: enrolments.firstName,
			email: enrolments.email,
			status: enrolments.status,
			courseId: enrolments.courseId,
			course: enrolments.course,
			courseName: courses.name
		})
		.from(enrolments)
		.leftJoin(courses, eq(enrolments.courseId, courses.id))
		.where(eq(enrolments.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!e) throw new Error(`Enrolment ${enrolmentId} not found`);
	if (e.status !== 'confirmed' || !e.courseId) return null;

	const open = (await openClassesFor(e.courseId)).filter((c) => !c.full);
	if (!open.length) return null;

	await sendMail({
		to: e.email,
		...classPickerEmail({
			firstName: e.firstName,
			courseName: e.courseName ?? e.course ?? 'your course',
			link: classLinkFor(origin, enrolmentId),
			classes: open
		})
	});
	return e.email;
}

/** Send the class link without letting a mail failure break the caller. */
export async function trySendClassPickerEmail(enrolmentId: number, origin?: string) {
	try {
		await sendClassPickerEmail(enrolmentId, origin);
	} catch (err) {
		console.error(
			`Error sending class link for enrolment ${enrolmentId}:`,
			err instanceof Error ? err.message : err
		);
	}
}

/**
 * Email a paid student the schedule of the class they're in: dates, weekly
 * sessions, location and instructor. Returns the address it went to, or null
 * when they aren't paid or aren't in a class.
 */
export async function sendClassScheduleEmail(enrolmentId: number): Promise<string | null> {
	if (!mailConfigured()) throw new Error('SMTP is not configured');

	const e = await db
		.select({
			firstName: enrolments.firstName,
			email: enrolments.email,
			status: enrolments.status,
			course: enrolments.course,
			courseName: courses.name,
			cls: classes
		})
		.from(enrolments)
		.leftJoin(courses, eq(enrolments.courseId, courses.id))
		.leftJoin(classes, eq(enrolments.classId, classes.id))
		.where(eq(enrolments.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!e) throw new Error(`Enrolment ${enrolmentId} not found`);
	if (e.status !== 'confirmed' || !e.cls) return null;

	const sessions = await db
		.select()
		.from(classSessions)
		.where(eq(classSessions.classId, e.cls.id))
		.orderBy(asc(classSessions.startTime));

	await sendMail({
		to: e.email,
		...classScheduleEmail({
			firstName: e.firstName,
			courseName: e.courseName ?? e.course ?? 'your course',
			className: e.cls.name,
			startDate: e.cls.startDate,
			endDate: e.cls.endDate,
			sessions: sortSessions(sessions).map((s) => [
				weekDays.find((d) => d.value === s.dayOfWeek)?.name ?? '',
				`${shortTime(s.startTime)}–${shortTime(s.endTime)}`
			]),
			location: e.cls.location,
			instructor: e.cls.instructor,
			notes: e.cls.notes
		})
	});
	return e.email;
}
