import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { certificates } from '$lib/server/db/schema';
import { formatCertificateDate } from '$lib/server/certificate';
import type { PageServerLoad } from './$types';

// Public: anyone with the number (e.g. an employer) can check a certificate is genuine
export const load: PageServerLoad = async ({ params }) => {
	const code = params.code.toUpperCase();
	const cert = await db
		.select({
			code: certificates.code,
			title: certificates.title,
			studentName: certificates.studentName,
			courseName: certificates.courseName,
			courseDetails: certificates.courseDetails,
			completedOn: certificates.completedOn,
			isActive: certificates.isActive
		})
		.from(certificates)
		.where(eq(certificates.code, code))
		.then((rows) => rows[0]);

	if (!cert) return { code, certificate: null };
	return {
		code,
		certificate: { ...cert, completedOn: formatCertificateDate(cert.completedOn) }
	};
};
