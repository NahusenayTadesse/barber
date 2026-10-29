import { and, count, eq, gte, inArray, isNull, ne, or } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { classSessions, classes, enrolments } from '$lib/server/db/schema';
import { classStatus, formatSessions, sortSessions } from '$lib/classes';

/** YYYY-MM-DD today in the UK, whatever timezone the server runs in. */
export const ukToday = () =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

/**
 * Put a student in a class (or take them out with classId = null).
 * Returns an error message, or null when it worked.
 */
export async function setStudentClass(
	enrolmentId: number,
	classId: number | null
): Promise<string | null> {
	const [student] = await db
		.select({ courseId: enrolments.courseId, classId: enrolments.classId })
		.from(enrolments)
		.where(eq(enrolments.id, enrolmentId));
	if (!student) return 'Unknown student.';

	if (classId !== null && student.classId !== classId) {
		const [cls] = await db
			.select({ courseId: classes.courseId, capacity: classes.capacity, name: classes.name })
			.from(classes)
			.where(eq(classes.id, classId));
		if (!cls) return 'Unknown class.';
		if (cls.courseId !== student.courseId) {
			return "That class is for a different course from the student's.";
		}
		if (cls.capacity !== null) {
			const [{ taken }] = await db
				.select({ taken: count() })
				.from(enrolments)
				.where(
					and(
						eq(enrolments.classId, classId),
						ne(enrolments.id, enrolmentId),
						ne(enrolments.status, 'cancelled')
					)
				);
			if (taken >= cls.capacity) return `${cls.name} is full (${cls.capacity} students).`;
		}
	}

	await db.update(enrolments).set({ classId }).where(eq(enrolments.id, enrolmentId));
	return null;
}

/**
 * The classes students can still join on a course: enabled and not finished,
 * soonest first. Full ones are included, marked full.
 */
export async function openClassesFor(courseId: number) {
	const today = ukToday();
	const rows = await db
		.select()
		.from(classes)
		.where(
			and(
				eq(classes.courseId, courseId),
				eq(classes.isActive, true),
				or(isNull(classes.endDate), gte(classes.endDate, today))
			)
		)
		.orderBy(classes.startDate);
	if (!rows.length) return [];

	const ids = rows.map((c) => c.id);
	const sessions = await db.select().from(classSessions).where(inArray(classSessions.classId, ids));
	const counts = await db
		.select({ classId: enrolments.classId, taken: count() })
		.from(enrolments)
		.where(and(inArray(enrolments.classId, ids), ne(enrolments.status, 'cancelled')))
		.groupBy(enrolments.classId);

	return rows.map((c) => {
		const own = sortSessions(sessions.filter((s) => s.classId === c.id));
		const taken = counts.find((n) => n.classId === c.id)?.taken ?? 0;
		const spotsLeft = c.capacity === null ? null : Math.max(c.capacity - taken, 0);
		return {
			id: c.id,
			name: c.name,
			startDate: c.startDate,
			endDate: c.endDate,
			location: c.location,
			instructor: c.instructor,
			notes: c.notes,
			sessions: own.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime })),
			schedule: formatSessions(own),
			spotsLeft,
			full: spotsLeft === 0,
			started: classStatus(c, today) === 'running'
		};
	});
}

export type OpenClass = Awaited<ReturnType<typeof openClassesFor>>[number];
