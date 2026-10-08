import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { certificates } from '$lib/server/db/schema';
import { certificateFileName, certificatePdf, certificateUrl } from '$lib/server/certificate';
import type { RequestHandler } from './$types';

/** The certificate as a PDF: shown in the browser, or downloaded with ?download */
export const GET: RequestHandler = async ({ params, url }) => {
	const cert = await db
		.select()
		.from(certificates)
		.where(eq(certificates.code, params.code.toUpperCase()))
		.then((rows) => rows[0]);
	if (!cert) error(404, 'Certificate not found');
	if (!cert.isActive) error(410, 'This certificate has been revoked');

	const pdf = await certificatePdf(cert, certificateUrl(url.origin, cert.code));
	const disposition = url.searchParams.has('download') ? 'attachment' : 'inline';

	return new Response(pdf, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `${disposition}; filename="${certificateFileName(cert.studentName, cert.code)}"`,
			'Cache-Control': 'private, no-store',
			'X-Robots-Tag': 'noindex'
		}
	});
};
