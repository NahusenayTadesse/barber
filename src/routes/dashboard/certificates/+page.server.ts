import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { certificates, courses, enrolments } from '$lib/server/db/schema';
import {
	certificateFileName,
	certificatePdf,
	certificateUrl,
	newCertificateCode
} from '$lib/server/certificate';
import { certificateEmail, mailConfigured, sendMail } from '$lib/server/mail';
import { certificateId, issueCertificate } from './schema';
import type { Actions, PageServerLoad } from './$types';

/** Today as a UK calendar date, YYYY-MM-DD */
const ukToday = () =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

/** e.g. "8 Weeks · Advanced Skills" */
const courseDetailsOf = (duration: string | null, level: string | null) =>
	[duration, level].filter(Boolean).join(' · ');

export const load: PageServerLoad = async ({ url }) => {
	const rows = await db
		.select({
			id: certificates.id,
			code: certificates.code,
			title: certificates.title,
			studentName: certificates.studentName,
			courseName: certificates.courseName,
			courseDetails: certificates.courseDetails,
			completedOn: certificates.completedOn,
			signatoryName: certificates.signatoryName,
			signatoryRole: certificates.signatoryRole,
			isActive: certificates.isActive,
			enrolmentId: certificates.enrolmentId,
			email: enrolments.email
		})
		.from(certificates)
		.leftJoin(enrolments, eq(certificates.enrolmentId, enrolments.id))
		.orderBy(desc(certificates.createdAt));

	const certificateList = rows.map((c) => ({
		...c,
		status: c.isActive ? 'Valid' : 'Revoked',
		verifyUrl: certificateUrl(url.origin, c.code)
	}));

	// Enrolments to issue certificates for, with the course details to print
	const enrolmentRows = await db
		.select({
			id: enrolments.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${enrolments.firstName}, ${enrolments.lastName}))`,
			course: sql<string>`COALESCE(${courses.name}, ${enrolments.course})`,
			duration: courses.duration,
			level: courses.level,
			status: enrolments.status
		})
		.from(enrolments)
		.leftJoin(courses, eq(enrolments.courseId, courses.id))
		.where(ne(enrolments.status, 'cancelled'))
		.orderBy(desc(enrolments.createdAt));

	// Enrolments that already have a valid certificate
	const certified = new Set(rows.filter((c) => c.isActive).map((c) => c.enrolmentId));
	const enrolmentOptions = enrolmentRows.map((e) => ({
		id: e.id,
		name: e.name,
		course: e.course ?? '',
		courseDetails: courseDetailsOf(e.duration, e.level),
		paid: e.status === 'confirmed',
		hasCertificate: certified.has(e.id)
	}));

	// The signatory carries over from the last certificate issued
	const last = rows[0];
	const form = await superValidate(
		{
			title: 'Certificate of Completion',
			completedOn: ukToday(),
			signatoryName: last?.signatoryName ?? '',
			signatoryRole: last?.signatoryRole ?? 'Academy Director'
		},
		zod4(issueCertificate),
		{ errors: false }
	);

	return { certificateList, enrolmentOptions, form, canEmail: mailConfigured() };
};

/** The certificate a dashboard action is about, with the student's email if known. */
async function certificateFor(request: Request) {
	const parsed = certificateId.safeParse(Object.fromEntries(await request.formData()));
	if (!parsed.success) return undefined;
	return db
		.select({ certificate: certificates, email: enrolments.email })
		.from(certificates)
		.leftJoin(enrolments, eq(certificates.enrolmentId, enrolments.id))
		.where(eq(certificates.id, parsed.data.id))
		.then((rows) => rows[0]);
}

export const actions: Actions = {
	issue: async ({ request, locals, url }) => {
		const form = await superValidate(request, zod4(issueCertificate));
		if (!locals.user) {
			return message(form, { type: 'error', text: 'Please log in again.' }, { status: 401 });
		}
		if (!form.valid) {
			return message(
				form,
				{ type: 'error', text: 'Please fix the errors in the form.' },
				{ status: 400 }
			);
		}

		const d = form.data;
		const enrolmentId = d.enrolmentId ? Number(d.enrolmentId) : null;

		if (enrolmentId) {
			const existing = await db
				.select({ code: certificates.code })
				.from(certificates)
				.where(and(eq(certificates.enrolmentId, enrolmentId), eq(certificates.isActive, true)))
				.then((rows) => rows[0]);
			if (existing) {
				return message(
					form,
					{
						type: 'error',
						text: `This enrolment already has certificate ${existing.code}. Revoke it first to issue a new one.`
					},
					{ status: 409 }
				);
			}
		}

		try {
			// Retry in the unlikely case a random number is already taken
			let code = '';
			for (let attempt = 0; attempt < 5 && !code; attempt++) {
				const candidate = newCertificateCode();
				const taken = await db
					.select({ id: certificates.id })
					.from(certificates)
					.where(eq(certificates.code, candidate))
					.then((rows) => rows.length > 0);
				if (!taken) code = candidate;
			}
			if (!code) throw new Error('Could not generate a unique certificate number');

			const [{ id }] = await db
				.insert(certificates)
				.values({
					code,
					enrolmentId,
					title: d.title,
					studentName: d.studentName,
					courseName: d.courseName,
					courseDetails: d.courseDetails || null,
					completedOn: d.completedOn,
					signatoryName: d.signatoryName || null,
					signatoryRole: d.signatoryRole || null,
					createdBy: locals.user.id
				})
				.$returningId();

			return message(form, {
				type: 'success',
				text: `Certificate ${code} issued to ${d.studentName}`,
				id,
				code,
				studentName: d.studentName,
				verifyUrl: certificateUrl(url.origin, code)
			});
		} catch (err) {
			console.error('Error issuing certificate:', err instanceof Error ? err.message : err);
			return message(
				form,
				{ type: 'error', text: 'Error while issuing the certificate.' },
				{ status: 500 }
			);
		}
	},

	revoke: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const found = await certificateFor(request);
		if (!found) return fail(404, { message: 'Certificate not found.' });
		await db
			.update(certificates)
			.set({ isActive: false, updatedBy: locals.user.id })
			.where(eq(certificates.id, found.certificate.id));
		return { message: `Certificate ${found.certificate.code} revoked` };
	},

	restore: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const found = await certificateFor(request);
		if (!found) return fail(404, { message: 'Certificate not found.' });
		await db
			.update(certificates)
			.set({ isActive: true, updatedBy: locals.user.id })
			.where(eq(certificates.id, found.certificate.id));
		return { message: `Certificate ${found.certificate.code} is valid again` };
	},

	email: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const found = await certificateFor(request);
		if (!found) return fail(404, { message: 'Certificate not found.' });
		const { certificate: cert, email } = found;

		if (!cert.isActive) return fail(400, { message: 'A revoked certificate cannot be sent.' });
		if (!email) {
			return fail(400, {
				message: 'No email address for this student. Download the PDF and send it instead.'
			});
		}
		if (!mailConfigured()) {
			return fail(500, {
				message: 'Email is not set up yet. Download the PDF and send it instead.'
			});
		}

		try {
			const verifyUrl = certificateUrl(url.origin, cert.code);
			await sendMail({
				to: email,
				...certificateEmail({
					studentName: cert.studentName,
					courseName: cert.courseName,
					verifyUrl
				}),
				attachments: [
					{
						filename: certificateFileName(cert.studentName, cert.code),
						content: await certificatePdf(cert, verifyUrl),
						contentType: 'application/pdf'
					}
				]
			});
		} catch (err) {
			console.error('Error emailing certificate:', err instanceof Error ? err.message : err);
			return fail(500, {
				message: "The email couldn't be sent. Download the PDF and send it instead."
			});
		}
		return { message: `Certificate emailed to ${email}` };
	}
};
