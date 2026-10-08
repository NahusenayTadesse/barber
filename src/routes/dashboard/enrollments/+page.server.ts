import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { enrolments as customers, courses, paymentMethods } from '$lib/server/db/schema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { methodAmountFor } from '$lib/discounts';
import { getCourseMethods } from '$lib/server/paymentMethods';
import { getActiveDiscounts } from '$lib/server/discounts';
import { mailConfigured, paymentLinkEmail, sendMail } from '$lib/server/mail';
import { payLinkFor } from '$lib/server/payLink';
import { registerStudent, sendLink } from './schema';

export const load: PageServerLoad = async ({ url }) => {
	const rows = await db
		.select({
			id: customers.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${customers.firstName}, ${customers.lastName}))`,
			email: customers.email,
			phone: customers.phone,
			paymentOption: customers.paymentOption,
			amount: customers.amount,
			discountName: customers.discountName,
			discountPercentage: customers.discountPercentage,
			course: sql<string>`COALESCE(${courses.name}, ${customers.course})`,
			basePrice: courses.basePrice,
			minPrice: courses.minPrice,
			methodKind: paymentMethods.kind,
			methodInstalments: paymentMethods.instalments,
			methodPercentOff: paymentMethods.percentOff,
			status: customers.status,
			enrolledAt: sql<string>`DATE_FORMAT(${customers.createdAt}, '%Y-%m-%d')`
		})
		.from(customers)
		.leftJoin(courses, eq(customers.courseId, courses.id))
		.leftJoin(paymentMethods, eq(customers.paymentMethodId, paymentMethods.id))
		.orderBy(desc(customers.createdAt));

	const customersList = rows.map(({ methodKind, methodInstalments, methodPercentOff, ...r }) => ({
		...r,
		paymentOption: r.paymentOption ?? '',
		// Amount charged at checkout. Enrolments made before it was recorded fall
		// back to an estimate from the course's current price.
		amount:
			r.amount !== null
				? Number(r.amount)
				: methodAmountFor(
						r.basePrice ? { basePrice: r.basePrice, minPrice: r.minPrice } : undefined,
						methodKind
							? {
									kind: methodKind,
									instalments: methodInstalments,
									percentOff: Number(methodPercentOff)
								}
							: undefined
					),
		discount: r.discountName ? `${r.discountName} (${Number(r.discountPercentage)}%)` : 'None',
		status: r.status === 'confirmed' ? 'paid' : r.status === 'pending' ? 'unpaid' : 'cancelled',
		// Link the student can use to pay, for anyone who still owes the amount
		payLink: r.status === 'pending' && Number(r.amount) > 0 ? payLinkFor(url.origin, r.id) : null
	}));

	const form = await superValidate({ status: 'unpaid' as const }, zod4(registerStudent), {
		errors: false
	});

	// Courses for the Register Student and Payment Link forms, with today's discount
	const courseRows = await db
		.select({
			id: courses.id,
			name: courses.name,
			basePrice: courses.basePrice,
			minPrice: courses.minPrice,
			isActive: courses.isActive
		})
		.from(courses)
		.orderBy(asc(courses.name));
	const discounts = await getActiveDiscounts(courseRows.map((c) => c.id));
	const methods = await getCourseMethods(courseRows.map((c) => c.id));
	const coursesList = courseRows.map((c) => ({
		...c,
		discountPercentage: discounts[c.id]?.percentage ?? 0,
		methods: (methods[c.id] ?? []).filter((m) => methodAmountFor(c, m) > 0)
	}));

	return {
		customersList,
		form,
		coursesList,
		canEmail: mailConfigured()
	};
};

export const actions: Actions = {
	// Record a student who enrolled in person (cash, bank transfer...), without Stripe
	register: async ({ request, locals, url }) => {
		const form = await superValidate(request, zod4(registerStudent));
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

		const { firstName, lastName, email, phone, amount, status } = form.data;
		const courseId = Number(form.data.courseId);
		const methodId = Number(form.data.paymentMethodId);

		const course = await db
			.select({ id: courses.id, name: courses.name })
			.from(courses)
			.where(eq(courses.id, courseId))
			.then((rows) => rows[0]);
		if (!course) {
			return message(
				form,
				{ type: 'error', text: 'Please select a valid course.' },
				{ status: 400 }
			);
		}

		const method = await db
			.select({ id: paymentMethods.id, name: paymentMethods.name })
			.from(paymentMethods)
			.where(eq(paymentMethods.id, methodId))
			.then((rows) => rows[0]);
		if (!method) {
			return message(
				form,
				{ type: 'error', text: 'Please select a valid payment option.' },
				{ status: 400 }
			);
		}

		try {
			const [{ id }] = await db
				.insert(customers)
				.values({
					firstName,
					lastName,
					email,
					phone: phone || null,
					courseId,
					course: course.name,
					paymentMethodId: method.id,
					paymentOption: method.name,
					amount: String(amount),
					status: status === 'paid' ? 'confirmed' : 'pending'
				})
				.$returningId();
			return message(form, {
				type: 'success',
				text: `${firstName} ${lastName} registered on ${course.name}`,
				// Unpaid students get a link to pay for this registration online
				enrolmentId: id,
				link: status === 'unpaid' && amount > 0 ? payLinkFor(url.origin, id) : null
			});
		} catch (err) {
			console.error('Error registering student:', err instanceof Error ? err.message : err);
			return message(
				form,
				{ type: 'error', text: 'Error while registering the student.' },
				{ status: 500 }
			);
		}
	},

	// Email an unpaid student the link to pay for their registration
	sendLink: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = sendLink.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown student.' });

		if (!mailConfigured()) {
			return fail(500, { message: 'Email is not set up yet. Copy the link and send it instead.' });
		}

		const enrolment = await db
			.select({
				id: customers.id,
				firstName: customers.firstName,
				email: customers.email,
				status: customers.status,
				amount: customers.amount,
				course: sql<string>`COALESCE(${courses.name}, ${customers.course})`
			})
			.from(customers)
			.leftJoin(courses, eq(customers.courseId, courses.id))
			.where(eq(customers.id, parsed.data.enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment || enrolment.status !== 'pending') {
			return fail(400, { message: 'This student has nothing left to pay.' });
		}

		try {
			await sendMail({
				to: enrolment.email,
				...paymentLinkEmail({
					firstName: enrolment.firstName,
					courseName: enrolment.course,
					link: payLinkFor(url.origin, enrolment.id),
					amountText: `The amount due is £${Number(enrolment.amount)}.`
				})
			});
		} catch (err) {
			console.error('Error sending payment link:', err instanceof Error ? err.message : err);
			return fail(500, {
				message: "The email couldn't be sent. Copy the link and send it instead."
			});
		}

		return { message: `Link emailed to ${enrolment.email}` };
	}
};
