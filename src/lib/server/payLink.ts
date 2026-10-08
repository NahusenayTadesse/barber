import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

// Payment links for students registered from the dashboard: /pay/<id>-<signature>.
// The signature stops anyone guessing other students' links from the id.

const sign = (id: number) =>
	createHmac('sha256', `pay-link:${env.BETTER_AUTH_SECRET}`)
		.update(String(id))
		.digest('base64url')
		.slice(0, 24);

export const payLinkFor = (origin: string, enrolmentId: number) =>
	`${origin}/pay/${enrolmentId}-${sign(enrolmentId)}`;

/** The enrolment id a payment link was made for, or null if the link is invalid. */
export function enrolmentIdFromToken(token: string): number | null {
	const match = /^(\d+)-([\w-]{24})$/.exec(token);
	if (!match) return null;
	const id = Number(match[1]);
	const expected = Buffer.from(sign(id));
	const given = Buffer.from(match[2]);
	return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}
