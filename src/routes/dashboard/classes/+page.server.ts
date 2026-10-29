import { fail } from '@sveltejs/kit';
import { desc, eq, sql } from 'drizzle-orm';
import type { z } from 'zod/v4';

import { db } from '$lib/server/db';
import { classSessions, classes, courses, enrolments } from '$lib/server/db/schema';
import { byAudience, courseLabel } from '$lib/courses';
import { classStatus, formatSessions, sortSessions } from '$lib/classes';
import { setStudentClass, ukToday } from '$lib/server/classes';
import { addClass, assignStudent, classId, editClass, removeStudent } from './schema';
import type { Actions, PageServerLoad } from './$types';

/** Parse a posted form, or give the first problem as a message. */
async function parse<T extends z.ZodType>(request: Request, schema: T) {
	const parsed = schema.safeParse(Object.fromEntries(await request.formData()));
	return parsed.success
		? { data: parsed.data as z.infer<T> }
		: { error: parsed.error.issues[0]?.message ?? 'Please check the form.' };
}

const toRow = (c: z.infer<typeof addClass>) => ({
	courseId: c.courseId,
	name: c.name,
	startDate: c.startDate,
	endDate: c.endDate || null,
	location: c.location || null,
	instructor: c.instructor || null,
	capacity: c.capacity,
	notes: c.notes || null,
	isActive: c.isActive
});

export const load: PageServerLoad = async () => {
	const today = ukToday();

	const allCourses = (
		await db
			.select({ id: courses.id, name: courses.name, audience: courses.audience })
			.from(courses)
			.orderBy(courses.name)
	).sort(byAudience);

	const classRows = await db.select().from(classes).orderBy(desc(classes.startDate));
	const sessions = await db.select().from(classSessions);

	// Students who can be put in a class: anyone not cancelled
	const students = await db
		.select({
			id: enrolments.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${enrolments.firstName}, ${enrolments.lastName}))`,
			email: enrolments.email,
			courseId: enrolments.courseId,
			classId: enrolments.classId,
			status: enrolments.status
		})
		.from(enrolments)
		.where(sql`${enrolments.status} <> 'cancelled'`)
		.orderBy(enrolments.firstName, enrolments.lastName);

	const classesList = classRows.map((c) => {
		const course = allCourses.find((co) => co.id === c.courseId);
		const own = sortSessions(
			sessions
				.filter((s) => s.classId === c.id)
				.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
		);
		const members = students.filter((s) => s.classId === c.id);
		return {
			...c,
			course: course ? courseLabel(course) : 'Deleted course',
			sessions: own,
			schedule: formatSessions(own),
			students: members.map(({ id, name, email, status }) => ({ id, name, email, status })),
			studentCount: members.length,
			// Students on the same course who could join (including those in another class)
			candidates: students
				.filter((s) => s.courseId === c.courseId && s.classId !== c.id)
				.map((s) => ({
					value: String(s.id),
					name: s.classId
						? `${s.name} (in ${classRows.find((o) => o.id === s.classId)?.name ?? 'another class'})`
						: s.name
				})),
			status: classStatus(c, today)
		};
	});

	const courseItems = allCourses.map((c) => ({ value: String(c.id), name: courseLabel(c) }));

	return { classesList, courseItems, today };
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const { data, error } = await parse(request, addClass);
		if (!data) return fail(400, { message: error });

		try {
			await db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(classes)
					.values({ ...toRow(data), createdBy: locals.user.id })
					.$returningId();
				await tx.insert(classSessions).values(data.sessions.map((s) => ({ ...s, classId: id })));
			});
		} catch (err) {
			console.error('Error creating class:', err);
			return fail(500, { message: "The class couldn't be created." });
		}
		return { message: `${data.name} added to the schedule` };
	},

	edit: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const { data, error } = await parse(request, editClass);
		if (!data) return fail(400, { message: error });

		try {
			await db.transaction(async (tx) => {
				const [current] = await tx
					.select({ courseId: classes.courseId })
					.from(classes)
					.where(eq(classes.id, data.id));
				if (!current) throw new Error('Unknown class');

				await tx
					.update(classes)
					.set({ ...toRow(data), updatedBy: locals.user.id })
					.where(eq(classes.id, data.id));
				await tx.delete(classSessions).where(eq(classSessions.classId, data.id));
				await tx
					.insert(classSessions)
					.values(data.sessions.map((s) => ({ ...s, classId: data.id })));
				// Students on the old course can't stay in a class for another course
				if (current.courseId !== data.courseId) {
					await tx.update(enrolments).set({ classId: null }).where(eq(enrolments.classId, data.id));
				}
			});
		} catch (err) {
			console.error('Error updating class:', err);
			return fail(500, { message: "The class couldn't be saved." });
		}
		return { message: `${data.name} saved` };
	},

	delete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const { data, error } = await parse(request, classId);
		if (!data) return fail(400, { message: error });

		try {
			// Sessions go with it; its students are left without a class
			await db.delete(classes).where(eq(classes.id, data.id));
		} catch (err) {
			console.error('Error deleting class:', err);
			return fail(500, { message: "The class couldn't be deleted." });
		}
		return { message: 'Class deleted' };
	},

	assignStudent: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const { data, error } = await parse(request, assignStudent);
		if (!data) return fail(400, { message: error });

		const problem = await setStudentClass(data.enrolmentId, data.classId);
		if (problem) return fail(400, { message: problem });
		return { message: 'Student added to the class' };
	},

	removeStudent: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const { data, error } = await parse(request, removeStudent);
		if (!data) return fail(400, { message: error });

		const problem = await setStudentClass(data.enrolmentId, null);
		if (problem) return fail(400, { message: problem });
		return { message: 'Student taken out of the class' };
	}
};
