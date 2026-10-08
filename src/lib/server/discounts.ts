import { and, eq, gt, inArray, lte, type SQL } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { courseDiscountCourses, courseDiscounts, courses } from '$lib/server/db/schema';
import type { ActiveDiscount, BannerDiscount } from '$lib/discounts';

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
			expiresAt: courseDiscounts.expiresAt,
			courseId: courseDiscountCourses.courseId,
			courseName: courses.name
		})
		.from(courseDiscounts)
		.innerJoin(courseDiscountCourses, eq(courseDiscountCourses.discountId, courseDiscounts.id))
		.innerJoin(courses, eq(courses.id, courseDiscountCourses.courseId))
		.where(and(liveDiscountsWhere(), eq(courses.isActive, true), extra));
}

/**
 * Best live discount for each course id. When several discounts cover the same
 * course, the highest percentage wins.
 */
export async function getActiveDiscounts(
	courseIds: number[]
): Promise<Record<number, ActiveDiscount>> {
	if (!courseIds.length) return {};
	const live = await liveDiscountCourses(inArray(courseDiscountCourses.courseId, courseIds));

	const best: Record<number, ActiveDiscount> = {};
	for (const d of live) {
		const percentage = Number(d.percentage);
		if (!best[d.courseId] || percentage > best[d.courseId].percentage) {
			best[d.courseId] = { id: d.id, name: d.name, percentage };
		}
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
		endsOn: best.expiresAt.toLocaleDateString('en-GB', {
			timeZone: 'Europe/London',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	};
}
