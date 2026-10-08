import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { coursePaymentMethods, paymentMethods } from '$lib/server/db/schema';
import type { PaymentMethod } from '$lib/discounts';

/** Enabled payment methods offered on each course, in display order. */
export async function getCourseMethods(
	courseIds: number[]
): Promise<Record<number, PaymentMethod[]>> {
	if (!courseIds.length) return {};
	const rows = await db
		.select({
			courseId: coursePaymentMethods.courseId,
			id: paymentMethods.id,
			name: paymentMethods.name,
			kind: paymentMethods.kind,
			instalments: paymentMethods.instalments,
			percentOff: paymentMethods.percentOff,
			description: paymentMethods.description
		})
		.from(coursePaymentMethods)
		.innerJoin(paymentMethods, eq(paymentMethods.id, coursePaymentMethods.methodId))
		.where(
			and(inArray(coursePaymentMethods.courseId, courseIds), eq(paymentMethods.isActive, true))
		)
		.orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.id));

	const byCourse: Record<number, PaymentMethod[]> = {};
	for (const { courseId, description, percentOff, ...m } of rows) {
		(byCourse[courseId] ??= []).push({
			...m,
			percentOff: Number(percentOff),
			lines: (description ?? '')
				.split('\n')
				.map((l) => l.trim())
				.filter(Boolean)
		});
	}
	return byCourse;
}

/** Payment methods for the dashboard's checkbox lists. */
export const methodItems = () =>
	db
		.select({ id: paymentMethods.id, name: paymentMethods.name, isActive: paymentMethods.isActive })
		.from(paymentMethods)
		.orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.id))
		.then((rows) =>
			rows.map((m) => ({
				value: String(m.id),
				name: m.isActive ? m.name : `${m.name} (disabled)`,
				isActive: m.isActive
			}))
		);

/** Replace the payment methods a course offers. */
export async function setCourseMethods(
	tx: Pick<typeof db, 'delete' | 'insert'>,
	courseId: number,
	methodIds: (string | number)[]
) {
	await tx.delete(coursePaymentMethods).where(eq(coursePaymentMethods.courseId, courseId));
	if (methodIds.length) {
		await tx
			.insert(coursePaymentMethods)
			.values(methodIds.map((methodId) => ({ courseId, methodId: Number(methodId) })));
	}
}
