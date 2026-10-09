import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { desc, eq } from 'drizzle-orm';

import { add as schema, edit as editSchema, deleteDiscount } from './schema.js';
import { db } from '$lib/server/db';
import { courseDiscountCourses, courseDiscounts, courses } from '$lib/server/db/schema';
import { discountStatus } from '$lib/discounts';
import type { Actions, PageServerLoad } from './$types.js';

// Discount days are UK calendar days, whatever timezone the server runs in
const TZ = 'Europe/London';

/** Milliseconds that UK time is ahead of UTC at a given instant (0 or 1h). */
const ukOffset = (at: Date) => {
	const p = Object.fromEntries(
		new Intl.DateTimeFormat('en-US', {
			timeZone: TZ,
			hourCycle: 'h23',
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		})
			.formatToParts(at)
			.map((part) => [part.type, part.value])
	);
	const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
	return asUtc - Math.floor(at.getTime() / 1000) * 1000;
};

/** The instant a UK wall-clock time (YYYY-MM-DD + HH:MM:SS) happens. */
const ukTime = (isoDate: string, time: string) => {
	const [y, m, d] = isoDate.split('-').map(Number);
	const [hh, mm, ss] = time.split(':').map(Number);
	const guess = Date.UTC(y, m - 1, d, hh, mm, ss);
	return new Date(guess - ukOffset(new Date(guess)));
};

/** YYYY-MM-DD of an instant, as a UK calendar date. */
const toIsoDate = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);

/** A discount runs from the start of its first day to the end of its last day (UK time). */
const toRange = (startsAt: string, expiresAt: string) => ({
	startsAt: ukTime(startsAt, '00:00:00'),
	expiresAt: ukTime(expiresAt, '23:59:59')
});

export const load: PageServerLoad = async () => {
	const today = toIsoDate(new Date());
	const form = await superValidate(
		{ startsAt: today, expiresAt: today, courseIds: [], isActive: true },
		zod4(schema),
		{ errors: false }
	);
	const editForm = await superValidate(zod4(editSchema));
	const deleteForm = await superValidate(zod4(deleteDiscount));

	const allCourses = await db.select({ id: courses.id, name: courses.name }).from(courses);
	const links = await db.select().from(courseDiscountCourses);
	const rows = await db.select().from(courseDiscounts).orderBy(desc(courseDiscounts.expiresAt));

	const discounts = rows.map((d) => {
		const courseIds = links.filter((l) => l.discountId === d.id).map((l) => l.courseId);
		const names = allCourses.filter((c) => courseIds.includes(c.id)).map((c) => c.name);
		return {
			id: d.id,
			name: d.name,
			percentage: Number(d.percentage),
			gender: d.gender ?? ('' as const),
			audience:
				d.gender === 'female' ? 'Women only' : d.gender === 'male' ? 'Men only' : 'Everyone',
			courseIds: courseIds.map(String),
			course:
				names.length && names.length === allCourses.length
					? 'All Courses'
					: names.join(', ') || 'None',
			startsAt: d.startsAt,
			expiresAt: d.expiresAt,
			startDate: toIsoDate(d.startsAt),
			expiryDate: toIsoDate(d.expiresAt),
			isActive: d.isActive,
			status: discountStatus(d)
		};
	});

	const courseItems = allCourses.map((c) => ({ value: String(c.id), name: c.name }));

	return { form, editForm, deleteForm, discounts, courseItems };
};

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(schema));
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

		const { name, percentage, gender, courseIds, startsAt, expiresAt, isActive } = form.data;

		try {
			await db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(courseDiscounts)
					.values({
						name,
						percentage: String(percentage),
						gender: gender || null,
						...toRange(startsAt, expiresAt),
						isActive,
						createdBy: locals.user.id
					})
					.$returningId();
				await tx
					.insert(courseDiscountCourses)
					.values(courseIds.map((courseId) => ({ discountId: id, courseId: Number(courseId) })));
			});
			return message(form, { type: 'success', text: 'Discount Successfully Created' });
		} catch (err) {
			console.error('Error creating discount:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while creating Discount.' },
				{ status: 500 }
			);
		}
	},

	edit: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(editSchema));
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

		const { id, name, percentage, gender, courseIds, startsAt, expiresAt, isActive } = form.data;

		try {
			await db.transaction(async (tx) => {
				await tx
					.update(courseDiscounts)
					.set({
						name,
						percentage: String(percentage),
						gender: gender || null,
						...toRange(startsAt, expiresAt),
						isActive,
						updatedBy: locals.user.id
					})
					.where(eq(courseDiscounts.id, id));
				await tx.delete(courseDiscountCourses).where(eq(courseDiscountCourses.discountId, id));
				await tx
					.insert(courseDiscountCourses)
					.values(courseIds.map((courseId) => ({ discountId: id, courseId: Number(courseId) })));
			});
			return message(form, { type: 'success', text: 'Discount Successfully Updated' });
		} catch (err) {
			console.error('Error updating discount:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while updating Discount.' },
				{ status: 500 }
			);
		}
	},

	delete: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(deleteDiscount));
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

		try {
			await db.delete(courseDiscounts).where(eq(courseDiscounts.id, form.data.id));
			return message(form, { type: 'success', text: 'Discount Successfully Deleted' });
		} catch (err) {
			console.error('Error deleting discount:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while deleting Discount.' },
				{ status: 500 }
			);
		}
	}
};
