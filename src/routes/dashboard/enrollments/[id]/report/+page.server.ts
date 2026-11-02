import { error, fail } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { studentReports } from '$lib/server/db/schema';
import { mailConfigured } from '$lib/server/mail';
import { emailStudentReport, getStudentReport } from '$lib/server/studentReport';
import { deleteReport, reportRange } from '../../schema';
import { rangeFrom } from './range';
import type { Actions, PageServerLoad } from './$types';

const enrolmentIdOf = (params: { id: string }) => {
	const id = Number(params.id);
	if (!Number.isInteger(id) || id <= 0) error(404, 'Student not found');
	return id;
};

export const load: PageServerLoad = async ({ params, url }) => {
	const { from, to } = rangeFrom(url);
	const report = await getStudentReport(enrolmentIdOf(params), from, to);
	if (!report) error(404, 'Student not found');
	return { report, canEmail: mailConfigured() };
};

export const actions: Actions = {
	// Email the student this period's report, PDF attached
	email: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const parsed = reportRange.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Pick the dates.' });
		}
		const outcome = await emailStudentReport(
			enrolmentIdOf(params),
			parsed.data.from,
			parsed.data.to
		);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
	},

	// Remove one session's report, e.g. one added to the wrong student
	deleteReport: async ({ request, params, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const parsed = deleteReport.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown report.' });

		const [result] = await db
			.delete(studentReports)
			.where(
				and(
					eq(studentReports.id, parsed.data.reportId),
					eq(studentReports.enrolmentId, enrolmentIdOf(params))
				)
			);
		if (result.affectedRows === 0) return fail(404, { message: 'Unknown report.' });
		return { message: 'Report deleted' };
	}
};
