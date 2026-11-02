import { error } from '@sveltejs/kit';
import { getStudentReport, reportFileName, reportPdf } from '$lib/server/studentReport';
import { rangeFrom } from '../range';
import type { RequestHandler } from './$types';

/** The report as a PDF: shown in the browser (to print), or downloaded with ?download */
export const GET: RequestHandler = async ({ params, url }) => {
	const id = Number(params.id);
	const { from, to } = rangeFrom(url);
	const report = Number.isInteger(id) && id > 0 ? await getStudentReport(id, from, to) : undefined;
	if (!report) error(404, 'Student not found');

	const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';
	return new Response(reportPdf(report), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `${disposition}; filename="${reportFileName(report)}"`,
			'Cache-Control': 'private, no-store'
		}
	});
};
