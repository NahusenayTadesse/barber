import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod/v4';
import { db } from '$lib/server/db';
import { classes, courses, enrolments } from '$lib/server/db/schema';
import { enrolmentIdFromClassToken } from '$lib/server/classLink';
import { openClassesFor, setStudentClass, ukToday } from '$lib/server/classes';
import type { Actions, PageServerLoad } from './$types';

/** The enrolment a class link points to, or a 404 for a wrong or edited link. */
async function enrolmentFor(token: string) {
	const id = enrolmentIdFromClassToken(token);
	const enrolment =
		id === null
			? undefined
			: await db
					.select({
						id: enrolments.id,
						firstName: enrolments.firstName,
						status: enrolments.status,
						courseId: enrolments.courseId,
						course: enrolments.course,
						courseName: courses.name,
						classId: enrolments.classId,
						className: classes.name,
						classStart: classes.startDate
					})
					.from(enrolments)
					.leftJoin(courses, eq(enrolments.courseId, courses.id))
					.leftJoin(classes, eq(enrolments.classId, classes.id))
					.where(eq(enrolments.id, id))
					.then((rows) => rows[0]);
	if (!enrolment) error(404, 'This class link is not valid');
	return enrolment;
}

/** Once their class has started, students can't switch it themselves. */
const locked = (e: { classStart: string | null }) =>
	e.classStart !== null && e.classStart <= ukToday();

export const load: PageServerLoad = async ({ params }) => {
	const e = await enrolmentFor(params.token);
	const paid = e.status === 'confirmed';
	return {
		firstName: e.firstName,
		course: e.courseName ?? e.course ?? 'your course',
		paid,
		current: e.classId ? { id: e.classId, name: e.className ?? 'Your class' } : null,
		locked: locked(e),
		classes: paid && e.courseId ? await openClassesFor(e.courseId) : []
	};
};

export const actions: Actions = {
	choose: async ({ params, request }) => {
		const e = await enrolmentFor(params.token);
		if (e.status !== 'confirmed' || !e.courseId) {
			return fail(400, { message: 'Only paid enrolments can choose a class.' });
		}

		const parsed = z
			.object({ classId: z.coerce.number().int().positive() })
			.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Please choose a class.' });
		const { classId } = parsed.data;

		if (classId === e.classId) return { message: `You're already in ${e.className}.` };
		if (locked(e)) {
			return fail(400, {
				message: 'Your class has already started. Please contact us to change it.'
			});
		}

		// Students may only pick classes that are open now, not disabled or finished ones
		const chosen = (await openClassesFor(e.courseId)).find((c) => c.id === classId);
		if (!chosen) return fail(400, { message: "That class isn't available any more." });
		if (chosen.full) return fail(400, { message: `Sorry, ${chosen.name} is now full.` });

		try {
			const problem = await setStudentClass(e.id, classId);
			if (problem) return fail(400, { message: problem });
		} catch (err) {
			console.error('Error choosing class:', err instanceof Error ? err.message : err);
			return fail(500, { message: "Your class couldn't be saved. Please try again." });
		}
		return { message: `You're booked into ${chosen.name}.` };
	}
};
