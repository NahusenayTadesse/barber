import { and, eq, gt, inArray, lte, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { courseDiscountCourses, courseDiscounts, courses } from '$lib/server/db/schema';
import {
	bestDiscount,
	type ActiveDiscount,
	type BannerDiscount,
	type Gender
} from '$lib/discounts';

/** Discounts that are enabled and within their start/expiration window right now. */
function liveDiscountsWhere() {
	const now = new Date();
	return and(
		eq(courseDiscounts.isActive, true),
		lte(courseDiscounts.startsAt, now),
		gt(courseDiscounts.expiresAt, now)
	);
}

/** Every live discount paired with each course it covers. */
function liveDiscountCourses(extra?: SQL) {
	return db
		.select({
			id: courseDiscounts.id,
			name: courseDiscounts.name,
			percentage: courseDiscounts.percentage,
			gender: courseDiscounts.gender,
			expiresAt: courseDiscounts.expiresAt,
			courseId: courseDiscountCourses.courseId,
			courseName: courses.name
		})
		.from(courseDiscounts)
		.innerJoin(courseDiscountCourses, eq(courseDiscountCourses.discountId, courseDiscounts.id))
		.innerJoin(courses, eq(courses.id, courseDiscountCourses.courseId))
		.where(and(liveDiscountsWhere(), eq(courses.isActive, true), extra));
}

/** Every live discount on each course id, including the ones for one gender only. */
export async function getCourseDiscounts(
	courseIds: number[]
): Promise<Record<number, ActiveDiscount[]>> {
	if (!courseIds.length) return {};
	const live = await liveDiscountCourses(inArray(courseDiscountCourses.courseId, courseIds));

	const byCourse: Record<number, ActiveDiscount[]> = {};
	for (const d of live) {
		(byCourse[d.courseId] ??= []).push({
			id: d.id,
			name: d.name,
			percentage: Number(d.percentage),
			gender: d.gender
		});
	}
	return byCourse;
}

/**
 * Best live discount for each course id. When several discounts cover the same
 * course, the highest percentage wins. Gender-only discounts count only when
 * that gender is given.
 */
export async function getActiveDiscounts(
	courseIds: number[],
	gender?: Gender | null
): Promise<Record<number, ActiveDiscount>> {
	const all = await getCourseDiscounts(courseIds);

	const best: Record<number, ActiveDiscount> = {};
	for (const [courseId, discounts] of Object.entries(all)) {
		const d = bestDiscount(discounts, gender);
		if (d) best[Number(courseId)] = d;
	}
	return best;
}

/**
 * The live discount to advertise in the site-wide popup (the biggest one).
 */
export async function getBannerDiscount(): Promise<BannerDiscount | null> {
	const live = await liveDiscountCourses();
	if (!live.length) return null;

	const best = live.reduce((a, b) => (Number(b.percentage) > Number(a.percentage) ? b : a));
	const covered = live.filter((d) => d.id === best.id);
	const totalCourses = (
		await db.select({ id: courses.id }).from(courses).where(eq(courses.isActive, true))
	).length;

	return {
		name: best.name,
		percentage: Number(best.percentage),
		courseLabel:
			covered.length >= totalCourses
				? 'all courses'
				: covered.length === 1
					? covered[0].courseName
					: 'selected courses',
		more: new Set(live.map((d) => d.id)).size > 1,
		gender: best.gender,
		endsOn: best.expiresAt.toLocaleDateString('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	};
}
