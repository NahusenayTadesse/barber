import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '$env/dynamic/private';

// Links for paid students to choose their class: /choose-class/<id>-<signature>.
// Signed separately from payment links, so one can't be turned into the other.

const sign = (id: number) =>
	createHmac('sha256', `class-link:${env.BETTER_AUTH_SECRET}`)
		.update(String(id))
		.digest('base64url')
		.slice(0, 24);

export const classLinkFor = (origin: string, enrolmentId: number) =>
	`${origin.replace(/\/+$/, '')}/choose-class/${enrolmentId}-${sign(enrolmentId)}`;

/** The enrolment id a class link was made for, or null if the link is invalid. */
export function enrolmentIdFromClassToken(token: string): number | null {
	const match = /^(\d+)-([\w-]{24})$/.exec(token);
	if (!match) return null;
	const id = Number(match[1]);
	const expected = Buffer.from(sign(id));
	const given = Buffer.from(match[2]);
	return expected.length === given.length && timingSafeEqual(expected, given) ? id : null;
}
