import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import {
	enrolments as customers,
	courses,
	discountNullifications,
	paymentMethods
} from '$lib/server/db/schema';
import { user } from '$lib/server/db/auth.schema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { methodAmountFor } from '$lib/discounts';
import { getCourseMethods } from '$lib/server/paymentMethods';
import { getActiveDiscounts, getCourseDiscounts } from '$lib/server/discounts';
import { stripe } from '$lib/server/stripe';
import { mailConfigured, paymentLinkEmail, sendMail } from '$lib/server/mail';
import { payLinkFor } from '$lib/server/payLink';
import { nullifyDiscount, registerStudent, sendLink } from './schema';

const pounds = (n: number) => Math.round(n * 100) / 100;

export const load: PageServerLoad = async ({ url }) => {
	const rows = await db
		.select({
			id: customers.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${customers.firstName}, ${customers.lastName}))`,
			gender: customers.gender,
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
			enrolledAt: sql<string>`DATE_FORMAT(${customers.createdAt}, '%Y-%m-%d')`,
			nullified: {
				discountName: discountNullifications.discountName,
				discountPercentage: discountNullifications.discountPercentage,
				amountPaid: discountNullifications.amountPaid,
				amountDue: discountNullifications.amountDue,
				reason: discountNullifications.reason,
				nullifiedOn: discountNullifications.nullifiedOn,
				by: user.name
			}
		})
		.from(customers)
		.leftJoin(courses, eq(customers.courseId, courses.id))
		.leftJoin(paymentMethods, eq(customers.paymentMethodId, paymentMethods.id))
		.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
		.leftJoin(user, eq(user.id, discountNullifications.createdBy))
		.orderBy(desc(customers.createdAt));

	const customersList = rows.map(
		({ methodKind, methodInstalments, methodPercentOff, nullified, ...r }) => {
			const course = r.basePrice ? { basePrice: r.basePrice, minPrice: r.minPrice } : undefined;
			const method = methodKind
				? { kind: methodKind, instalments: methodInstalments, percentOff: Number(methodPercentOff) }
				: undefined;
			// Amount charged at checkout. Enrolments made before it was recorded fall
			// back to an estimate from the course's current price.
			const amount = r.amount !== null ? Number(r.amount) : methodAmountFor(course, method);
			const percentage = Number(r.discountPercentage ?? 0);
			// What this payment would have been without the discount
			const undiscounted =
				percentage < 100
					? pounds(amount / (1 - percentage / 100))
					: methodAmountFor(course, method);

			return {
				...r,
				paymentOption: r.paymentOption ?? '',
				amount,
				discount: nullified?.discountName
					? `Removed: ${nullified.discountName} (${Number(nullified.discountPercentage)}%)`
					: r.discountName
						? `${r.discountName} (${percentage}%)`
						: 'None',
				// Audit record when the discount was taken off this student
				nullified: nullified?.discountName
					? {
							amountPaid: Number(nullified.amountPaid),
							amountDue: Number(nullified.amountDue),
							reason: nullified.reason,
							nullifiedOn: nullified.nullifiedOn,
							by: nullified.by ?? 'Unknown'
						}
					: null,
				// Suggested amount still owed once the discount is removed: the full
				// price if they haven't paid yet, otherwise the difference
				owedWithoutDiscount:
					r.discountName && r.status !== 'cancelled'
						? r.status === 'pending'
							? undiscounted
							: Math.max(pounds(undiscounted - amount), 0)
						: null,
				status: r.status === 'confirmed' ? 'paid' : r.status === 'pending' ? 'unpaid' : 'cancelled',
				// Link the student can use to pay, for anyone who still owes the amount
				payLink:
					r.status === 'pending' && Number(r.amount) > 0 ? payLinkFor(url.origin, r.id) : null
			};
		}
	);

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
	const discounts = await getCourseDiscounts(courseRows.map((c) => c.id));
	const methods = await getCourseMethods(courseRows.map((c) => c.id));
	const coursesList = courseRows.map((c) => ({
		...c,
		// The form picks the best one for the student's gender
		discounts: discounts[c.id] ?? [],
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

		const { firstName, lastName, gender, email, phone, amount, status } = form.data;
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

		// Recorded so the discount can be removed later if it turns out not to apply
		const discount = (await getActiveDiscounts([course.id], gender || null))[course.id];

		try {
			const [{ id }] = await db
				.insert(customers)
				.values({
					firstName,
					lastName,
					gender: gender || null,
					email,
					phone: phone || null,
					courseId,
					course: course.name,
					paymentMethodId: method.id,
					paymentOption: method.name,
					amount: String(amount),
					discountName: discount?.name ?? null,
					discountPercentage: discount ? String(discount.percentage) : null,
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
				course: sql<string>`COALESCE(${courses.name}, ${customers.course})`,
				removedDiscount: discountNullifications.discountName
			})
			.from(customers)
			.leftJoin(courses, eq(customers.courseId, courses.id))
			.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
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
					amountText: enrolment.removedDiscount
						? `The ${enrolment.removedDiscount} discount has been removed from your enrolment, so the remaining balance due is £${Number(enrolment.amount)}.`
						: `The amount due is £${Number(enrolment.amount)}.`
				})
			});
		} catch (err) {
			console.error('Error sending payment link:', err instanceof Error ? err.message : err);
			return fail(500, {
				message: "The email couldn't be sent. Copy the link and send it instead."
			});
		}

		return { message: `Link emailed to ${enrolment.email}` };
	},

	// Take a discount off a student (e.g. they gave the wrong gender for a
	// women/men-only discount). Their payment link then charges what's left.
	nullifyDiscount: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = nullifyDiscount.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, amountDue, reason, nullifiedOn } = parsed.data;

		const enrolment = await db
			.select({
				id: customers.id,
				status: customers.status,
				amount: customers.amount,
				discountName: customers.discountName,
				discountPercentage: customers.discountPercentage,
				stripeSessionId: customers.stripeSessionId,
				alreadyNullified: discountNullifications.id
			})
			.from(customers)
			.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
			.where(eq(customers.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment) return fail(404, { message: 'Unknown student.' });
		if (enrolment.alreadyNullified) {
			return fail(400, { message: "This student's discount was already removed." });
		}
		if (!enrolment.discountName || enrolment.status === 'cancelled') {
			return fail(400, { message: 'This student has no discount to remove.' });
		}

		// A checkout the student started at the discounted price must not be paid any more
		if (enrolment.status === 'pending' && enrolment.stripeSessionId) {
			try {
				await stripe.checkout.sessions.expire(enrolment.stripeSessionId);
			} catch {
				// Already expired or completed: nothing to stop
			}
		}

		try {
			await db.transaction(async (tx) => {
				await tx.insert(discountNullifications).values({
					enrolmentId,
					discountName: enrolment.discountName!,
					discountPercentage: enrolment.discountPercentage ?? '0',
					amountPaid: enrolment.status === 'confirmed' ? (enrolment.amount ?? '0') : '0',
					amountDue: String(amountDue),
					reason,
					nullifiedOn,
					createdBy: locals.user!.id
				});
				await tx
					.update(customers)
					.set({
						discountName: null,
						discountPercentage: null,
						stripeSessionId: null,
						// Owing money again: unpaid, with a link for the amount due
						...(amountDue > 0 ? { amount: String(amountDue), status: 'pending' as const } : {})
					})
					.where(eq(customers.id, enrolmentId));
			});
		} catch (err) {
			console.error('Error removing discount:', err instanceof Error ? err.message : err);
			return fail(500, { message: 'Error while removing the discount.' });
		}

		return {
			message:
				amountDue > 0
					? `Discount removed. Send the payment link for £${amountDue} from the Payment Link column.`
					: 'Discount removed.'
		};
	}
};
