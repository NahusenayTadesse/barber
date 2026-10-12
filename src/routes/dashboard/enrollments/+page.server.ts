import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import {
	enrolments as customers,
	courses,
	discountNullifications,
	notificationEmails,
	paymentMethods,
	paymentWays
} from '$lib/server/db/schema';
import { user } from '$lib/server/db/auth.schema';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { methodAmountFor } from '$lib/discounts';
import { audienceLabels, audienceParam, byAudience } from '$lib/courses';
import { getCourseMethods } from '$lib/server/paymentMethods';
import { getActiveDiscounts, getCourseDiscounts } from '$lib/server/discounts';
import { confirmEnrolment, stripe } from '$lib/server/stripe';
import { manualPaymentWay, manualPaymentWays } from '$lib/server/paymentWays';
import { STRIPE_WAY } from '$lib/paymentWays';
import { mailConfigured, paymentLinkEmail, sendMail } from '$lib/server/mail';
import { payLinkFor } from '$lib/server/payLink';
import { sendWelcomeEmail, trySendWelcomeEmail } from '$lib/server/welcome';
import { alwaysNotified, tryNotifyAdmins } from '$lib/server/adminNotify';
import { tryNotifyStatusChange } from '$lib/server/statusNotify';
import {
	addNotificationEmail,
	editStudent,
	nullifyDiscount,
	registerStudent,
	removeNotificationEmail,
	sendLink,
	setPayment
} from './schema';

const pounds = (n: number) => Math.round(n * 100) / 100;

export const load: PageServerLoad = async ({ url }) => {
	// ?for=men or ?for=women shows only students on those courses
	const audience = audienceParam(url);
	const rows = await db
		.select({
			id: customers.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${customers.firstName}, ${customers.lastName}))`,
			firstName: customers.firstName,
			lastName: customers.lastName,
			email: customers.email,
			phone: customers.phone,
			paymentOption: customers.paymentOption,
			amount: customers.amount,
			discountName: customers.discountName,
			discountPercentage: customers.discountPercentage,
			course: sql<string>`COALESCE(${courses.name}, ${customers.course})`,
			audience: courses.audience,
			basePrice: courses.basePrice,
			minPrice: courses.minPrice,
			methodKind: paymentMethods.kind,
			methodInstalments: paymentMethods.instalments,
			methodPercentOff: paymentMethods.percentOff,
			status: customers.status,
			paymentWayId: customers.paymentWayId,
			paymentWayName: paymentWays.name,
			paymentWaySlug: paymentWays.slug,
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
		.leftJoin(paymentWays, eq(customers.paymentWayId, paymentWays.id))
		.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
		.leftJoin(user, eq(user.id, discountNullifications.createdBy))
		.where(audience ? eq(courses.audience, audience) : undefined)
		.orderBy(desc(customers.createdAt));

	const customersList = rows.map(
		({
			methodKind,
			methodInstalments,
			methodPercentOff,
			nullified,
			paymentWayName,
			paymentWaySlug,
			...r
		}) => {
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
				// How they paid. Stripe payments are set automatically and locked.
				paidBy: paymentWayName ?? (r.status === 'confirmed' ? 'Not recorded' : '—'),
				paidByStripe: paymentWaySlug === STRIPE_WAY,
				// Whose hair the course is for; unknown if the course was deleted
				audience: r.audience ? audienceLabels[r.audience] : '—',
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
			audience: courses.audience,
			basePrice: courses.basePrice,
			minPrice: courses.minPrice,
			isActive: courses.isActive
		})
		.from(courses)
		.orderBy(asc(courses.name))
		.then((rows) => rows.sort(byAudience));
	const discounts = await getCourseDiscounts(courseRows.map((c) => c.id));
	const methods = await getCourseMethods(courseRows.map((c) => c.id));
	const coursesList = courseRows.map((c) => ({
		...c,
		discounts: discounts[c.id] ?? [],
		methods: (methods[c.id] ?? []).filter((m) => methodAmountFor(c, m) > 0)
	}));

	// Who is emailed about new enrolments
	const notifications = {
		always: alwaysNotified(),
		saved: await db
			.select({ id: notificationEmails.id, email: notificationEmails.email })
			.from(notificationEmails)
			.orderBy(asc(notificationEmails.email))
	};

	return {
		customersList,
		form,
		coursesList,
		canEmail: mailConfigured(),
		notifications,
		audience,
		// For recording payments made outside Stripe
		paymentWays: await manualPaymentWays()
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
		// Paid students are recorded with how they paid (never Stripe)
		const way = status === 'paid' ? await manualPaymentWay(Number(form.data.paymentWayId)) : null;
		if (way === undefined) {
			return message(
				form,
				{ type: 'error', text: 'Please choose how the student paid.' },
				{ status: 400 }
			);
		}
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
		const discount = (await getActiveDiscounts([course.id]))[course.id];

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
					discountName: discount?.name ?? null,
					discountPercentage: discount ? String(discount.percentage) : null,
					status: status === 'paid' ? 'confirmed' : 'pending',
					paymentWayId: way?.id ?? null
				})
				.$returningId();
			// Students who have already paid are enrolled, so welcome them now
			if (status === 'paid') {
				await Promise.all([
					trySendWelcomeEmail(id),
					tryNotifyAdmins(
						id,
						`Registered in the dashboard by ${locals.user.name}, paid by ${way!.name}`
					)
				]);
			}
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

	// Record how and whether a student paid outside Stripe (bank transfer, cash...).
	// Payments made through Stripe are set automatically and can't be changed here.
	setPayment: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setPayment.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, status } = parsed.data;

		const enrolment = await db
			.select({
				id: customers.id,
				status: customers.status,
				stripeSessionId: customers.stripeSessionId,
				waySlug: paymentWays.slug
			})
			.from(customers)
			.leftJoin(paymentWays, eq(customers.paymentWayId, paymentWays.id))
			.where(eq(customers.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment) return fail(404, { message: 'Unknown student.' });
		if (enrolment.waySlug === STRIPE_WAY) {
			return fail(400, {
				message: "This student paid through Stripe, so their payment can't be changed."
			});
		}

		const way = status === 'paid' ? await manualPaymentWay(Number(parsed.data.paymentWayId)) : null;
		if (way === undefined) return fail(400, { message: 'Choose how the student paid.' });

		// An unpaid student may have a Stripe checkout open from their payment link.
		// Once they're paid or cancelled here it must not be payable any more, and if
		// it was paid in the meantime, Stripe's payment stands instead.
		if (enrolment.status === 'pending' && enrolment.stripeSessionId && status !== 'unpaid') {
			try {
				let session = await stripe.checkout.sessions.retrieve(enrolment.stripeSessionId);
				if (session.status === 'open') {
					session = await stripe.checkout.sessions.expire(session.id);
				}
				if (session.status === 'complete' && (await confirmEnrolment(session))) {
					return fail(400, {
						message:
							'This student has just paid through Stripe, so their payment is already recorded.'
					});
				}
			} catch (err) {
				console.error('Checking Stripe checkout failed:', err instanceof Error ? err.message : err);
				return fail(500, {
					message: "Couldn't check the student's Stripe payment. Please try again."
				});
			}
		}

		const newStatus =
			status === 'paid' ? 'confirmed' : status === 'unpaid' ? 'pending' : ('cancelled' as const);
		try {
			await db
				.update(customers)
				.set({ status: newStatus, paymentWayId: way?.id ?? null })
				.where(eq(customers.id, enrolmentId));
		} catch (err) {
			console.error('Error saving payment:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The payment couldn't be saved." });
		}

		// A changed status is emailed to the student and staff. Newly paid students
		// get the welcome email (saying how they paid), as for an online payment.
		const changed = newStatus !== enrolment.status;
		if (changed && newStatus === 'confirmed') {
			await Promise.all([
				trySendWelcomeEmail(enrolmentId),
				tryNotifyAdmins(enrolmentId, `Marked as paid in the dashboard by ${locals.user.name}`)
			]);
		} else if (changed && newStatus !== 'confirmed') {
			await tryNotifyStatusChange(enrolmentId, {
				from: enrolment.status ?? 'pending',
				to: newStatus,
				by: locals.user.name,
				origin: url.origin
			});
		}

		const saved =
			newStatus === 'confirmed'
				? `Marked as paid by ${way!.name}`
				: newStatus === 'pending'
					? 'Marked as unpaid'
					: 'Marked as cancelled';
		return {
			message: !changed
				? saved
				: mailConfigured()
					? `${saved}. The student and staff have been emailed.`
					: `${saved}. Email isn't set up, so no one was emailed.`
		};
	},

	// Correct a student's name, email or phone. Nothing else about the enrolment changes.
	editStudent: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = editStudent.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, firstName, lastName, email, phone } = parsed.data;

		try {
			const [result] = await db
				.update(customers)
				.set({ firstName, lastName, email, phone: phone || null })
				.where(eq(customers.id, enrolmentId));
			if (result.affectedRows === 0) return fail(404, { message: 'Unknown student.' });
		} catch (err) {
			console.error('Error editing student:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The student's details couldn't be saved." });
		}

		return { message: `${firstName} ${lastName}'s details updated` };
	},

	// Add an address to tell about new enrolments
	addNotificationEmail: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = addNotificationEmail.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Enter a valid email.' });
		}
		const { email } = parsed.data;
		if (email === alwaysNotified()) {
			return fail(400, { message: `${email} is always notified already.` });
		}

		try {
			await db.insert(notificationEmails).values({ email });
		} catch (err) {
			const e = err as { code?: string; cause?: { code?: string } };
			if (e?.code === 'ER_DUP_ENTRY' || e?.cause?.code === 'ER_DUP_ENTRY') {
				return fail(400, { message: `${email} is already on the list.` });
			}
			console.error('Error adding notification email:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The email couldn't be added." });
		}
		return { message: `${email} will be notified of new enrolments` };
	},

	removeNotificationEmail: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = removeNotificationEmail.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown email.' });

		await db.delete(notificationEmails).where(eq(notificationEmails.id, parsed.data.id));
		return { message: 'Email removed from the notification list' };
	},

	// Send a paid student their welcome email again
	resendWelcome: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = sendLink.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown student.' });

		if (!mailConfigured()) {
			return fail(500, { message: 'Email is not set up yet.' });
		}

		const enrolment = await db
			.select({ status: customers.status })
			.from(customers)
			.where(eq(customers.id, parsed.data.enrolmentId))
			.then((rows) => rows[0]);
		if (enrolment?.status !== 'confirmed') {
			return fail(400, { message: 'Only paid students get a welcome email.' });
		}

		try {
			const email = await sendWelcomeEmail(parsed.data.enrolmentId);
			return { message: `Welcome email sent to ${email}` };
		} catch (err) {
			console.error('Error resending welcome email:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The welcome email couldn't be sent." });
		}
	},

	// Take a discount off a student who shouldn't have had it. Their payment
	// link then charges what's left.
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
						// Owing money again: unpaid, with a link for the amount due (paid
						// however they like, so the earlier payment way no longer applies)
						...(amountDue > 0
							? { amount: String(amountDue), status: 'pending' as const, paymentWayId: null }
							: {})
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
