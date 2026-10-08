import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { asc, eq } from 'drizzle-orm';

import { add as schema, edit as editSchema, deleteMethod } from './schema.js';
import { db } from '$lib/server/db';
import { coursePaymentMethods, courses, paymentMethods } from '$lib/server/db/schema';
import { paymentMethodKindLabels } from '$lib/discounts';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	const form = await superValidate({ kind: 'full', isActive: true }, zod4(schema), {
		errors: false
	});
	const editForm = await superValidate(zod4(editSchema));
	const deleteForm = await superValidate(zod4(deleteMethod));

	const allCourses = await db.select({ id: courses.id, name: courses.name }).from(courses);
	const links = await db.select().from(coursePaymentMethods);
	const rows = await db
		.select()
		.from(paymentMethods)
		.orderBy(asc(paymentMethods.sortOrder), asc(paymentMethods.id));

	const methods = rows.map((m) => {
		const courseIds = links.filter((l) => l.methodId === m.id).map((l) => l.courseId);
		const names = allCourses.filter((c) => courseIds.includes(c.id)).map((c) => c.name);
		return {
			id: m.id,
			name: m.name,
			kind: m.kind,
			type:
				m.kind === 'instalments' ? `${m.instalments} Instalments` : paymentMethodKindLabels[m.kind],
			instalments: m.instalments,
			percentOff: Number(m.percentOff),
			description: m.description ?? '',
			sortOrder: m.sortOrder,
			courseIds: courseIds.map(String),
			course:
				names.length && names.length === allCourses.length
					? 'All Courses'
					: names.join(', ') || 'None',
			isActive: m.isActive,
			status: m.isActive ? 'Active' : 'Disabled'
		};
	});

	const courseItems = allCourses.map((c) => ({ value: String(c.id), name: c.name }));

	return { form, editForm, deleteForm, methods, courseItems };
};

const values = (data: {
	name: string;
	kind: 'full' | 'instalments' | 'deposit';
	instalments: number | null;
	percentOff: number;
	description: string;
	sortOrder: number;
	isActive: boolean;
}) => ({
	name: data.name,
	kind: data.kind,
	instalments: data.kind === 'instalments' ? data.instalments : null,
	percentOff: String(data.percentOff),
	description: data.description.trim() || null,
	sortOrder: data.sortOrder,
	isActive: data.isActive
});

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

		try {
			await db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(paymentMethods)
					.values({ ...values(form.data), createdBy: locals.user.id })
					.$returningId();
				if (form.data.courseIds.length) {
					await tx
						.insert(coursePaymentMethods)
						.values(form.data.courseIds.map((c) => ({ methodId: id, courseId: Number(c) })));
				}
			});
			return message(form, { type: 'success', text: 'Payment Method Successfully Created' });
		} catch (err) {
			console.error('Error creating payment method:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while creating the Payment Method.' },
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

		const { id, courseIds } = form.data;
		try {
			await db.transaction(async (tx) => {
				await tx
					.update(paymentMethods)
					.set({ ...values(form.data), updatedBy: locals.user.id })
					.where(eq(paymentMethods.id, id));
				await tx.delete(coursePaymentMethods).where(eq(coursePaymentMethods.methodId, id));
				if (courseIds.length) {
					await tx
						.insert(coursePaymentMethods)
						.values(courseIds.map((c) => ({ methodId: id, courseId: Number(c) })));
				}
			});
			return message(form, { type: 'success', text: 'Payment Method Successfully Updated' });
		} catch (err) {
			console.error('Error updating payment method:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while updating the Payment Method.' },
				{ status: 500 }
			);
		}
	},

	delete: async ({ request, locals }) => {
		const form = await superValidate(request, zod4(deleteMethod));
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
			// Enrolments that used it keep the method's name
			await db.delete(paymentMethods).where(eq(paymentMethods.id, form.data.id));
			return message(form, { type: 'success', text: 'Payment Method Successfully Deleted' });
		} catch (err) {
			console.error('Error deleting payment method:', err);
			return message(
				form,
				{ type: 'error', text: 'Error while deleting the Payment Method.' },
				{ status: 500 }
			);
		}
	}
};
