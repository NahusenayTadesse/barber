import { randomInt } from 'node:crypto';

export { certificatePdf, formatCertificateDate, type CertificateData } from './pdf';

// No 0/O or 1/I, so a number read out over the phone can't be mistaken
const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** A new certificate number, e.g. DDBA-2026-7K3QX9 */
export function newCertificateCode(year = new Date().getFullYear()) {
	let suffix = '';
	for (let i = 0; i < 6; i++) suffix += ALPHABET[randomInt(ALPHABET.length)];
	return `DDBA-${year}-${suffix}`;
}

/** Public page where anyone can check a certificate is genuine. */
export const certificateUrl = (origin: string, code: string) => `${origin}/certificates/${code}`;

/** File name for the downloaded PDF, e.g. "Certificate-Jane-Doe-DDBA-2026-7K3QX9.pdf" */
export const certificateFileName = (studentName: string, code: string) =>
	`Certificate-${studentName.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}-${code}.pdf`;
