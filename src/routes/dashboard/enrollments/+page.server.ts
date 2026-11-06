import type { Actions, PageServerLoad } from './$types';
import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import {
	enrolments as customers,
	enrolmentPayments,
	courses,
	discountNullifications,
	notificationEmails,
	paymentMethods,
	paymentWays,
	classes,
	studentReports,
	studentReportMarks
} from '$lib/server/db/schema';
import { user } from '$lib/server/db/auth.schema';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { methodAmountFor, methodTotalFor } from '$lib/discounts';
import { nextPayment, planProgress } from '$lib/paymentPlan';
import { audienceLabels, audienceParam, byAudience } from '$lib/courses';
import { getCourseMethods } from '$lib/server/paymentMethods';
import { getActiveDiscounts, getCourseDiscounts } from '$lib/server/discounts';
import { closeCheckout, stripe } from '$lib/server/stripe';
import { manualPaymentWay, manualPaymentWays } from '$lib/server/paymentWays';
import { STRIPE_WAY } from '$lib/paymentWays';
import { customEmail, mailConfigured, paymentLinkEmail, sendMail } from '$lib/server/mail';
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
	setClass,
	setNotes,
	setPayment,
	bulkStudents,
	bulkPayment,
	bulkEmail,
	addReport,
	bulkReport,
	recordPayment,
	deletePayment,
	setPlan,
	CUSTOM_PLAN,
	setBalanceLink
} from './schema';
import { markSheetFor } from '$lib/markSheets';
import { emailStudentReport } from '$lib/server/studentReport';
import { setStudentClass } from '$lib/server/classes';
import {
	sendClassPickerEmail,
	sendClassScheduleEmail,
	trySendClassPickerEmail
} from '$lib/server/classPicker';
import { classLinkFor } from '$lib/server/classLink';

const pounds = (n: number) => Math.round(n * 100) / 100;
// Today as a UK calendar date
const today = () =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());
// Everything a student has paid so far, from their payment history
const paidSoFar = sql<string>`(SELECT COALESCE(SUM(${enrolmentPayments.amount}), 0) FROM ${enrolmentPayments} WHERE ${enrolmentPayments.enrolmentId} = ${customers.id})`;

/**
 * What a student owes in total, has paid and has left to pay. Enrolments made
 * before the total was recorded fall back to an estimate from what they paid.
 */
function balanceFor(e: {
	status: string | null;
	amount: number;
	totalPrice: string | null;
	paid: string | number;
	methodKind?: string | null;
	methodInstalments?: number | null;
}) {
	const paid = pounds(Number(e.paid));
	const total =
		e.totalPrice !== null
			? Number(e.totalPrice)
			: e.methodKind === 'instalments'
				? pounds(e.amount * Math.max(e.methodInstalments ?? 1, 1))
				: e.amount;
	const left = e.status === 'cancelled' ? 0 : Math.max(pounds(total - paid), 0);
	return { total, paid, left };
}

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
			totalPrice: customers.totalPrice,
			paid: paidSoFar,
			balanceLinkAmount: customers.balanceLinkAmount,
			planInstalments: customers.planInstalments,
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
			courseId: customers.courseId,
			classId: customers.classId,
			notes: customers.notes,
			className: classes.name,
			// For the report dialog: which mark sheet, who teaches and when the class began
			sheet: sql<'men' | 'women'>`COALESCE(${courses.audience}, 'men')`,
			instructor: classes.instructor,
			classStart: classes.startDate,
			reportCount: sql<number>`(SELECT COUNT(*) FROM ${studentReports} WHERE ${studentReports.enrolmentId} = ${customers.id})`,
			lastReport: sql<
				string | null
			>`(SELECT DATE_FORMAT(MAX(${studentReports.reportDate}), '%Y-%m-%d') FROM ${studentReports} WHERE ${studentReports.enrolmentId} = ${customers.id})`,
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
		.leftJoin(classes, eq(customers.classId, classes.id))
		.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
		.leftJoin(user, eq(user.id, discountNullifications.createdBy))
		.where(audience ? eq(courses.audience, audience) : undefined)
		.orderBy(desc(customers.createdAt));

	// Every payment made, for each student's payment history
	const paymentRows = await db
		.select({
			id: enrolmentPayments.id,
			enrolmentId: enrolmentPayments.enrolmentId,
			amount: enrolmentPayments.amount,
			paidOn: sql<string>`DATE_FORMAT(${enrolmentPayments.paidOn}, '%Y-%m-%d')`,
			note: enrolmentPayments.note,
			way: paymentWays.name,
			waySlug: paymentWays.slug,
			stripeSessionId: enrolmentPayments.stripeSessionId,
			by: user.name
		})
		.from(enrolmentPayments)
		.leftJoin(paymentWays, eq(enrolmentPayments.paymentWayId, paymentWays.id))
		.leftJoin(user, eq(user.id, enrolmentPayments.createdBy))
		.orderBy(asc(enrolmentPayments.paidOn), asc(enrolmentPayments.id));
	const paymentsByStudent = new Map<number, StudentPayment[]>();
	for (const { enrolmentId, stripeSessionId, waySlug, ...p } of paymentRows) {
		const list = paymentsByStudent.get(enrolmentId) ?? [];
		list.push({
			...p,
			amount: Number(p.amount),
			way: p.way ?? 'Not recorded',
			// Stripe payments are recorded automatically and can't be deleted
			byStripe: !!stripeSessionId || waySlug === STRIPE_WAY
		});
		paymentsByStudent.set(enrolmentId, list);
	}

	const customersList = rows.map(
		({
			methodKind,
			methodInstalments,
			methodPercentOff,
			nullified,
			paymentWayName,
			paymentWaySlug,
			paid: paidRaw,
			totalPrice,
			balanceLinkAmount,
			planInstalments,
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
			const payments = paymentsByStudent.get(r.id) ?? [];
			const { total, paid, left } = balanceFor({
				status: r.status,
				amount,
				totalPrice,
				paid: paidRaw,
				methodKind,
				methodInstalments
			});
			// Their own plan if one was agreed, otherwise their payment method's
			const instalments =
				planInstalments ?? (methodKind === 'instalments' ? methodInstalments : null);
			const progress = r.status === 'cancelled' ? null : planProgress(total, paid, instalments);
			const linkAmount = Number(balanceLinkAmount ?? 0);
			// How they've paid so far, e.g. "Stripe" or "Stripe, Cash"
			const ways = [...new Set(payments.map((p) => p.way).filter((w) => w !== 'Not recorded'))];

			return {
				...r,
				paymentOption: r.paymentOption ?? '',
				reportCount: Number(r.reportCount),
				// How they paid. Stripe payments are set automatically and locked.
				paidBy: ways.length
					? ways.join(', ')
					: (paymentWayName ?? (r.status === 'confirmed' ? 'Not recorded' : '—')),
				paidByStripe: paymentWaySlug === STRIPE_WAY,
				// Whose hair the course is for; unknown if the course was deleted
				audience: r.audience ? audienceLabels[r.audience] : '—',
				amount,
				// The student's payments towards the course and what's left to pay
				balance: {
					total,
					paid,
					left,
					payments,
					// Instalments in their plan (null when not paying by instalments), and
					// how far through them their payments so far take them
					instalments,
					progress,
					// Suggested next payment: the rest of the current instalment, or what's left
					next: nextPayment(left, progress),
					// Amount of the Stripe link for their next payment, if one was sent
					linkAmount: r.status === 'confirmed' && linkAmount > 0 ? linkAmount : null
				},
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
				// Shown in the Status column: paid students who still owe part of the
				// course price are partially paid
				paymentStatus:
					r.status === 'confirmed'
						? left > 0
							? 'partially paid'
							: 'paid'
						: r.status === 'pending'
							? 'unpaid'
							: 'cancelled',
				className: r.className ?? 'No class',
				// Link a paid student uses to choose (or change) their class
				classLink: r.status === 'confirmed' ? classLinkFor(url.origin, r.id) : null,
				// Link the student can use to pay, for anyone who still owes the amount
				// (or, once enrolled, a further payment staff have asked for)
				payLink:
					(r.status === 'pending' && Number(r.amount) > 0) ||
					(r.status === 'confirmed' && linkAmount > 0)
						? payLinkFor(url.origin, r.id)
						: null
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

	// Classes a student can be put in, from the Class column
	const classOptions = await db
		.select({ id: classes.id, name: classes.name, courseId: classes.courseId })
		.from(classes)
		.orderBy(desc(classes.startDate));

	return {
		customersList,
		classOptions,
		form,
		coursesList,
		canEmail: mailConfigured(),
		notifications,
		audience,
		// For recording payments made outside Stripe
		paymentWays: await manualPaymentWays()
	};
};

export type StudentPayment = {
	id: number;
	amount: number;
	paidOn: string;
	note: string | null;
	way: string;
	by: string | null;
	byStripe: boolean;
};

type Outcome = { ok: true; message: string } | { ok: false; status: number; message: string };
const failed = (status: number, message: string): Outcome => ({ ok: false, status, message });

/** Email an unpaid student the link to pay for their registration */
async function emailPayLink(enrolmentId: number, origin: string): Promise<Outcome> {
	const enrolment = await db
		.select({
			id: customers.id,
			firstName: customers.firstName,
			email: customers.email,
			status: customers.status,
			amount: customers.amount,
			totalPrice: customers.totalPrice,
			balanceLinkAmount: customers.balanceLinkAmount,
			paid: paidSoFar,
			course: sql<string>`COALESCE(${courses.name}, ${customers.course})`,
			removedDiscount: discountNullifications.discountName
		})
		.from(customers)
		.leftJoin(courses, eq(customers.courseId, courses.id))
		.leftJoin(discountNullifications, eq(discountNullifications.enrolmentId, customers.id))
		.where(eq(customers.id, enrolmentId))
		.then((rows) => rows[0]);
	// An enrolled student staff have asked for a further payment (e.g. an instalment)
	const further = enrolment?.status === 'confirmed' && Number(enrolment.balanceLinkAmount) > 0;
	if (!enrolment || (enrolment.status !== 'pending' && !further)) {
		return failed(400, 'This student has nothing left to pay.');
	}

	let amountText: string;
	if (further) {
		const due = Number(enrolment.balanceLinkAmount);
		const leftAfter =
			enrolment.totalPrice !== null
				? Math.max(pounds(Number(enrolment.totalPrice) - Number(enrolment.paid) - due), 0)
				: null;
		amountText =
			`The amount due is £${due}.` +
			(leftAfter === null
				? ''
				: leftAfter > 0
					? ` After this payment, £${leftAfter} will be left to pay.`
					: ' This payment completes your course fees.');
	} else {
		amountText = enrolment.removedDiscount
			? `The ${enrolment.removedDiscount} discount has been removed from your enrolment, so the remaining balance due is £${Number(enrolment.amount)}.`
			: `The amount due is £${Number(enrolment.amount)}.`;
	}

	try {
		await sendMail({
			to: enrolment.email,
			...paymentLinkEmail({
				firstName: enrolment.firstName,
				courseName: enrolment.course,
				link: payLinkFor(origin, enrolment.id),
				amountText,
				further
			})
		});
	} catch (err) {
		console.error('Error sending payment link:', err instanceof Error ? err.message : err);
		return failed(500, "The email couldn't be sent. Copy the link and send it instead.");
	}

	return { ok: true, message: `Link emailed to ${enrolment.email}` };
}

/** Send a paid student their welcome email again */
async function resendWelcomeEmail(enrolmentId: number): Promise<Outcome> {
	const enrolment = await db
		.select({ status: customers.status })
		.from(customers)
		.where(eq(customers.id, enrolmentId))
		.then((rows) => rows[0]);
	if (enrolment?.status !== 'confirmed') {
		return failed(400, 'Only paid students get a welcome email.');
	}

	try {
		const email = await sendWelcomeEmail(enrolmentId);
		return { ok: true, message: `Welcome email sent to ${email}` };
	} catch (err) {
		console.error('Error resending welcome email:', err instanceof Error ? err.message : err);
		return failed(500, "The welcome email couldn't be sent.");
	}
}

/** Email a student a message written in the dashboard */
async function emailCustom(
	enrolmentId: number,
	subject: string,
	message: string
): Promise<Outcome> {
	const enrolment = await db
		.select({ firstName: customers.firstName, email: customers.email })
		.from(customers)
		.where(eq(customers.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!enrolment) return failed(404, 'Unknown student.');

	try {
		await sendMail({
			to: enrolment.email,
			...customEmail({ firstName: enrolment.firstName, subject, message })
		});
	} catch (err) {
		console.error('Error sending custom email:', err instanceof Error ? err.message : err);
		return failed(500, "The email couldn't be sent.");
	}
	return { ok: true, message: `Email sent to ${enrolment.email}` };
}

/** Email a paid student the link to choose their class */
async function emailClassLink(enrolmentId: number, origin: string): Promise<Outcome> {
	try {
		const email = await sendClassPickerEmail(enrolmentId, origin);
		if (!email) {
			return failed(
				400,
				'Only paid students on a course with classes that have places left can choose.'
			);
		}
		return { ok: true, message: `Class link emailed to ${email}` };
	} catch (err) {
		console.error('Error sending class link:', err instanceof Error ? err.message : err);
		return failed(500, "The class link couldn't be sent.");
	}
}

/** Email a paid student the schedule of the class they're in */
async function emailClassSchedule(enrolmentId: number): Promise<Outcome> {
	try {
		const email = await sendClassScheduleEmail(enrolmentId);
		if (!email) return failed(400, 'Only paid students who are in a class get a schedule.');
		return { ok: true, message: `Class schedule emailed to ${email}` };
	} catch (err) {
		console.error('Error sending class schedule:', err instanceof Error ? err.message : err);
		return failed(500, "The class schedule couldn't be sent.");
	}
}

/**
 * Remove a student's enrolment for good, e.g. a test or duplicate registration.
 * Their discount removal record goes with it; certificates stay, unlinked.
 */
async function deleteEnrolment(enrolmentId: number): Promise<Outcome> {
	const enrolment = await db
		.select({
			status: customers.status,
			stripeSessionId: customers.stripeSessionId,
			balanceLinkAmount: customers.balanceLinkAmount,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${customers.firstName}, ${customers.lastName}))`
		})
		.from(customers)
		.where(eq(customers.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!enrolment) return failed(404, 'Unknown student.');

	// A student may have a Stripe checkout open from their payment link (to enrol,
	// or for a further payment). It must not be payable once the enrolment is gone.
	if (
		enrolment.stripeSessionId &&
		(enrolment.status === 'pending' || enrolment.balanceLinkAmount !== null)
	) {
		try {
			if ((await closeCheckout(enrolment.stripeSessionId)) && enrolment.status === 'pending') {
				return failed(400, "This student has just paid through Stripe, so they weren't deleted.");
			}
		} catch (err) {
			console.error('Checking Stripe checkout failed:', err instanceof Error ? err.message : err);
			return failed(500, "Couldn't check the student's Stripe payment. Please try again.");
		}
	}

	try {
		await db.delete(customers).where(eq(customers.id, enrolmentId));
	} catch (err) {
		console.error('Error deleting student:', err instanceof Error ? err.message : err);
		return failed(500, "The student couldn't be deleted.");
	}

	return { ok: true, message: `${enrolment.name} deleted` };
}

/**
 * Record how and whether a student paid outside Stripe (bank transfer, cash...).
 * Payments made through Stripe are set automatically and can't be changed here.
 */
async function applyPayment(
	enrolmentId: number,
	status: 'paid' | 'unpaid' | 'cancelled',
	paymentWayId: string,
	staff: { id: string; name: string },
	origin: string,
	// The payment received, when newly paid; by default the amount they owed
	payment?: { amount: number; paidOn: string; note: string }
): Promise<Outcome> {
	const by = staff.name;
	const enrolment = await db
		.select({
			id: customers.id,
			status: customers.status,
			amount: customers.amount,
			stripeSessionId: customers.stripeSessionId,
			balanceLinkAmount: customers.balanceLinkAmount,
			paymentWayId: customers.paymentWayId,
			waySlug: paymentWays.slug
		})
		.from(customers)
		.leftJoin(paymentWays, eq(customers.paymentWayId, paymentWays.id))
		.where(eq(customers.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!enrolment) return failed(404, 'Unknown student.');
	if (enrolment.waySlug === STRIPE_WAY) {
		return failed(400, "This student paid through Stripe, so their payment can't be changed.");
	}

	const way = status === 'paid' ? await manualPaymentWay(Number(paymentWayId)) : null;
	if (way === undefined) return failed(400, 'Choose how the student paid.');

	// An unpaid student may have a Stripe checkout open from their payment link.
	// Once they're paid or cancelled here it must not be payable any more, and if
	// it was paid in the meantime, Stripe's payment stands instead.
	if (enrolment.status === 'pending' && enrolment.stripeSessionId && status !== 'unpaid') {
		try {
			if (await closeCheckout(enrolment.stripeSessionId)) {
				return failed(
					400,
					'This student has just paid through Stripe, so their payment is already recorded.'
				);
			}
		} catch (err) {
			console.error('Checking Stripe checkout failed:', err instanceof Error ? err.message : err);
			return failed(500, "Couldn't check the student's Stripe payment. Please try again.");
		}
	}

	const newStatus =
		status === 'paid' ? 'confirmed' : status === 'unpaid' ? 'pending' : ('cancelled' as const);

	// An enrolled student's link for a further payment stops once their status changes
	if (
		enrolment.status === 'confirmed' &&
		newStatus !== 'confirmed' &&
		enrolment.balanceLinkAmount !== null &&
		enrolment.stripeSessionId
	) {
		try {
			await closeCheckout(enrolment.stripeSessionId);
		} catch (err) {
			console.error('Closing Stripe checkout failed:', err instanceof Error ? err.message : err);
			return failed(500, "Couldn't stop the student's Stripe payment link. Please try again.");
		}
	}

	const amountReceived = payment?.amount ?? Number(enrolment.amount ?? 0);
	const newlyPaid = newStatus === 'confirmed' && enrolment.status !== 'confirmed';
	try {
		await db.transaction(async (tx) => {
			await tx
				.update(customers)
				.set({
					status: newStatus,
					paymentWayId: way?.id ?? null,
					...(newStatus !== 'confirmed' && { balanceLinkAmount: null })
				})
				.where(eq(customers.id, enrolmentId));
			if (newlyPaid && amountReceived > 0) {
				// Kept in their payment history
				await tx.insert(enrolmentPayments).values({
					enrolmentId,
					amount: String(amountReceived),
					paymentWayId: way!.id,
					paidOn: payment?.paidOn ?? today(),
					note: payment?.note || null,
					createdBy: staff.id
				});
			} else if (
				newStatus === 'confirmed' &&
				enrolment.paymentWayId &&
				enrolment.paymentWayId !== way!.id
			) {
				// Correcting how they paid: their first payment in the history follows
				const [first] = await tx
					.select({ id: enrolmentPayments.id })
					.from(enrolmentPayments)
					.where(
						and(
							eq(enrolmentPayments.enrolmentId, enrolmentId),
							eq(enrolmentPayments.paymentWayId, enrolment.paymentWayId),
							isNull(enrolmentPayments.stripeSessionId)
						)
					)
					.orderBy(asc(enrolmentPayments.paidOn), asc(enrolmentPayments.id))
					.limit(1);
				if (first) {
					await tx
						.update(enrolmentPayments)
						.set({ paymentWayId: way!.id })
						.where(eq(enrolmentPayments.id, first.id));
				}
			}
		});
	} catch (err) {
		console.error('Error saving payment:', err instanceof Error ? err.message : err);
		return failed(500, "The payment couldn't be saved.");
	}

	// A changed status is emailed to the student and staff. Newly paid students
	// get the welcome email (saying how they paid), as for an online payment.
	const changed = newStatus !== enrolment.status;
	if (changed && newStatus === 'confirmed') {
		await Promise.all([
			trySendWelcomeEmail(enrolmentId).then(() => trySendClassPickerEmail(enrolmentId, origin)),
			tryNotifyAdmins(enrolmentId, `Marked as paid in the dashboard by ${by}`)
		]);
	} else if (changed && newStatus !== 'confirmed') {
		await tryNotifyStatusChange(enrolmentId, {
			from: enrolment.status ?? 'pending',
			to: newStatus,
			by,
			origin
		});
	}

	const saved =
		newStatus === 'confirmed'
			? newlyPaid && amountReceived > 0
				? `£${amountReceived} recorded, paid by ${way!.name}`
				: `Marked as paid by ${way!.name}`
			: newStatus === 'pending'
				? 'Marked as unpaid'
				: 'Marked as cancelled';
	return {
		ok: true,
		message: !changed
			? saved
			: mailConfigured()
				? `${saved}. The student and staff have been emailed.`
				: `${saved}. Email isn't set up, so no one was emailed.`
	};
}

/**
 * Run one student action for each selected student, one at a time, and sum up
 * how it went, e.g. "3 marked as paid. 1 skipped: This student paid through Stripe..."
 */
async function forEachStudent(ids: number[], done: string, run: (id: number) => Promise<Outcome>) {
	let succeeded = 0;
	const problems = new Map<string, number>();
	for (const id of ids) {
		const outcome = await run(id);
		if (outcome.ok) succeeded++;
		else problems.set(outcome.message, (problems.get(outcome.message) ?? 0) + 1);
	}

	const skipped = [...problems].map(([reason, n]) => `${n} skipped: ${reason}`).join(' ');
	const message = [`${succeeded} ${done}.`, skipped].filter(Boolean).join(' ');
	return succeeded ? { message } : fail(400, { message });
}

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

		const { firstName, lastName, email, phone, amount, status, notes } = form.data;
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
		// A plan agreed with the student rather than one of the course's methods
		const custom = form.data.paymentMethodId === CUSTOM_PLAN;
		const methodId = custom ? 0 : Number(form.data.paymentMethodId);

		const course = await db
			.select({
				id: courses.id,
				name: courses.name,
				basePrice: courses.basePrice,
				minPrice: courses.minPrice
			})
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

		const method = custom
			? null
			: await db
					.select({
						id: paymentMethods.id,
						name: paymentMethods.name,
						kind: paymentMethods.kind,
						instalments: paymentMethods.instalments,
						percentOff: paymentMethods.percentOff
					})
					.from(paymentMethods)
					.where(eq(paymentMethods.id, methodId))
					.then((rows) => rows[0]);
		if (!custom && !method) {
			return message(
				form,
				{ type: 'error', text: 'Please select a valid payment option.' },
				{ status: 400 }
			);
		}

		// Recorded so the discount can be removed later if it turns out not to apply
		const discount = (await getActiveDiscounts([course.id]))[course.id];
		// The whole course price, paid over the deposit or instalments. Paying in
		// full, the amount entered is the whole price; a custom plan sets its own.
		const { planInstalments } = form.data;
		const totalPrice = !method
			? form.data.totalPrice
			: method.kind === 'full'
				? amount
				: Math.max(
						methodTotalFor(
							course,
							{ ...method, percentOff: Number(method.percentOff) },
							discount?.percentage
						),
						amount
					);

		try {
			const id = await db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(customers)
					.values({
						firstName,
						lastName,
						email,
						phone: phone || null,
						notes: notes || null,
						courseId,
						course: course.name,
						paymentMethodId: method?.id ?? null,
						paymentOption: method
							? method.name
							: planInstalments > 1
								? `Custom plan: ${planInstalments} instalments`
								: 'Custom plan',
						amount: String(amount),
						totalPrice: String(totalPrice),
						planInstalments: method ? null : planInstalments,
						discountName: discount?.name ?? null,
						discountPercentage: discount ? String(discount.percentage) : null,
						status: status === 'paid' ? 'confirmed' : 'pending',
						paymentWayId: way?.id ?? null
					})
					.$returningId();
				// Their first payment, kept in their payment history
				if (way && amount > 0) {
					await tx.insert(enrolmentPayments).values({
						enrolmentId: id,
						amount: String(amount),
						paymentWayId: way.id,
						paidOn: today(),
						createdBy: locals.user!.id
					});
				}
				return id;
			});
			// Students who have already paid are enrolled, so welcome them now
			if (status === 'paid') {
				await Promise.all([
					trySendWelcomeEmail(id).then(() => trySendClassPickerEmail(id, url.origin)),
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
		const outcome = await emailPayLink(parsed.data.enrolmentId, url.origin);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
	},

	// Record how and whether a student paid outside Stripe (bank transfer, cash...).
	// Payments made through Stripe are set automatically and can't be changed here.
	setPayment: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setPayment.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, status, paymentWayId } = parsed.data;
		const outcome = await applyPayment(enrolmentId, status, paymentWayId, locals.user, url.origin);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
	},

	// Put a student in a class on the schedule, or take them out (classId empty)
	setClass: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setClass.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, classId } = parsed.data;

		try {
			const problem = await setStudentClass(enrolmentId, classId);
			if (problem) return fail(400, { message: problem });
		} catch (err) {
			console.error('Error setting class:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The student's class couldn't be saved." });
		}

		return { message: classId ? 'Class updated' : 'Student taken out of their class' };
	},

	// Email a paid student the link to choose their class, e.g. after adding classes
	sendClassLink: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = sendLink.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown student.' });
		if (!mailConfigured()) return fail(500, { message: 'Email is not set up yet.' });

		const outcome = await emailClassLink(parsed.data.enrolmentId, url.origin);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
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

	// Add, change or clear the notes on a student
	setNotes: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setNotes.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the notes.' });
		}
		const { enrolmentId, notes } = parsed.data;

		const [result] = await db
			.update(customers)
			.set({ notes: notes || null })
			.where(eq(customers.id, enrolmentId));
		if (result.affectedRows === 0) return fail(404, { message: 'Unknown student.' });
		return { message: notes ? 'Notes saved' : 'Notes cleared' };
	},

	// Remove a student's enrolment for good, e.g. a test or duplicate registration.
	// Their discount removal record goes with it; certificates stay, unlinked.
	deleteStudent: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = sendLink.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown student.' });
		const outcome = await deleteEnrolment(parsed.data.enrolmentId);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
	},

	// Record a payment made outside Stripe (bank transfer, cash...), e.g. a later
	// instalment. A student who hadn't paid yet becomes paid.
	recordPayment: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = recordPayment.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentId, amount, paymentWayId, paidOn, note } = parsed.data;

		const enrolment = await db
			.select({ status: customers.status })
			.from(customers)
			.where(eq(customers.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment) return fail(404, { message: 'Unknown student.' });

		// Their first payment: recorded the same way as marking them paid
		if (enrolment.status !== 'confirmed') {
			const outcome = await applyPayment(
				enrolmentId,
				'paid',
				paymentWayId,
				locals.user,
				url.origin,
				{
					amount,
					paidOn,
					note
				}
			);
			return outcome.ok
				? { message: outcome.message }
				: fail(outcome.status, { message: outcome.message });
		}

		const way = await manualPaymentWay(Number(paymentWayId));
		if (!way) return fail(400, { message: 'Choose how the student paid.' });

		try {
			await db.insert(enrolmentPayments).values({
				enrolmentId,
				amount: String(amount),
				paymentWayId: way.id,
				paidOn,
				note: note || null,
				createdBy: locals.user.id
			});
		} catch (err) {
			console.error('Error recording payment:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The payment couldn't be saved." });
		}
		return { message: `£${amount} recorded, paid by ${way.name}` };
	},

	// Delete a payment recorded by mistake. Stripe payments can't be deleted.
	deletePayment: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = deletePayment.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) return fail(400, { message: 'Unknown payment.' });

		const payment = await db
			.select({
				id: enrolmentPayments.id,
				stripeSessionId: enrolmentPayments.stripeSessionId,
				waySlug: paymentWays.slug
			})
			.from(enrolmentPayments)
			.leftJoin(paymentWays, eq(enrolmentPayments.paymentWayId, paymentWays.id))
			.where(eq(enrolmentPayments.id, parsed.data.paymentId))
			.then((rows) => rows[0]);
		if (!payment) return fail(404, { message: 'Unknown payment.' });
		if (payment.stripeSessionId || payment.waySlug === STRIPE_WAY) {
			return fail(400, { message: "Payments made through Stripe can't be deleted." });
		}

		await db.delete(enrolmentPayments).where(eq(enrolmentPayments.id, payment.id));
		return { message: 'Payment deleted' };
	},

	// Change a student's payment plan: the whole course price they owe and how
	// many instalments they pay it in, e.g. after agreeing a different arrangement
	setPlan: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setPlan.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the plan.' });
		}
		const { enrolmentId, totalPrice, planInstalments } = parsed.data;

		const [result] = await db
			.update(customers)
			.set({ totalPrice: String(totalPrice), planInstalments })
			.where(eq(customers.id, enrolmentId));
		if (result.affectedRows === 0) return fail(404, { message: 'Unknown student.' });
		return {
			message:
				planInstalments && planInstalments > 1
					? `Plan set to £${totalPrice} in ${planInstalments} instalments`
					: `Plan set to £${totalPrice}`
		};
	},

	// Make (or stop, with 0) a Stripe payment link for an enrolled student's next
	// payment, e.g. their next instalment, and optionally email it to them
	setBalanceLink: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });

		const parsed = setBalanceLink.safeParse(Object.fromEntries(await request.formData()));
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the amount.' });
		}
		const { enrolmentId, amount, email } = parsed.data;

		const enrolment = await db
			.select({
				status: customers.status,
				amount: customers.amount,
				totalPrice: customers.totalPrice,
				paid: paidSoFar,
				stripeSessionId: customers.stripeSessionId
			})
			.from(customers)
			.where(eq(customers.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment) return fail(404, { message: 'Unknown student.' });
		if (enrolment.status !== 'confirmed') {
			return fail(400, {
				message:
					'Only students who have made their first payment can be sent a link for a further payment. Unpaid students use the link in the Payment Link column.'
			});
		}

		// The previous link's checkout (if any) must not be paid at its old amount.
		// If it was just paid, that payment is recorded first.
		if (enrolment.stripeSessionId) {
			try {
				await closeCheckout(enrolment.stripeSessionId);
			} catch (err) {
				console.error('Closing Stripe checkout failed:', err instanceof Error ? err.message : err);
				return fail(500, {
					message: "Couldn't check the student's Stripe payment. Please try again."
				});
			}
		}

		if (amount > 0) {
			// Read again: closing the old checkout may have just recorded a payment
			const paid = await db
				.select({ paid: paidSoFar })
				.from(customers)
				.where(eq(customers.id, enrolmentId))
				.then((rows) => rows[0]?.paid ?? enrolment.paid);
			const { left } = balanceFor({ ...enrolment, amount: Number(enrolment.amount ?? 0), paid });
			if (amount > left) {
				return fail(400, {
					message:
						left > 0 ? `Only £${left} is left to pay.` : 'This student has nothing left to pay.'
				});
			}
		}

		await db
			.update(customers)
			.set({ balanceLinkAmount: amount > 0 ? String(amount) : null })
			.where(eq(customers.id, enrolmentId));
		if (amount === 0) return { message: 'Payment link stopped' };

		const link = payLinkFor(url.origin, enrolmentId);
		if (!email) return { message: `Payment link for £${amount} ready`, link };
		if (!mailConfigured()) {
			return {
				message: `Payment link for £${amount} ready. Email isn't set up, so copy the link and send it.`,
				link
			};
		}
		const outcome = await emailPayLink(enrolmentId, url.origin);
		return {
			message: outcome.ok
				? `Payment link for £${amount} emailed`
				: `Payment link for £${amount} ready, but ${outcome.message.charAt(0).toLowerCase()}${outcome.message.slice(1)}`,
			link
		};
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

		const outcome = await resendWelcomeEmail(parsed.data.enrolmentId);
		return outcome.ok
			? { message: outcome.message }
			: fail(outcome.status, { message: outcome.message });
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
				totalPrice: customers.totalPrice,
				paid: paidSoFar,
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

		// A checkout the student started at the discounted price (or a further
		// payment link) must not be paid any more
		if (enrolment.stripeSessionId) {
			try {
				await stripe.checkout.sessions.expire(enrolment.stripeSessionId);
			} catch {
				// Already expired or completed: nothing to stop
			}
		}

		// Without the discount, the whole course costs more: at least what they've
		// paid plus what's now due
		const percentage = Number(enrolment.discountPercentage ?? 0);
		const undiscountedTotal =
			enrolment.totalPrice !== null && percentage < 100
				? pounds(Number(enrolment.totalPrice) / (1 - percentage / 100))
				: 0;
		const totalPrice = Math.max(undiscountedTotal, pounds(Number(enrolment.paid) + amountDue));

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
						balanceLinkAmount: null,
						totalPrice: String(totalPrice),
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
	},

	// A teacher's report on one practice session, marked against the course's mark sheet
	addReport: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const formData = await request.formData();
		const parsed = addReport.safeParse({
			...Object.fromEntries(formData),
			skills: formData.getAll('skill'),
			marks: formData.getAll('mark')
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the report.' });
		}
		const { enrolmentId, reportDate, week, teacherName, comment, skills, marks } = parsed.data;

		const enrolment = await db
			.select({ audience: courses.audience })
			.from(customers)
			.leftJoin(courses, eq(customers.courseId, courses.id))
			.where(eq(customers.id, enrolmentId))
			.then((rows) => rows[0]);
		if (!enrolment) return fail(404, { message: 'Unknown student.' });
		const sheetWeek = markSheetFor(enrolment.audience).find((w) => w.week === week);
		if (!sheetWeek) return fail(400, { message: 'Choose a week from the mark sheet.' });

		const given = skills
			.map((skill, i) => ({ skill, mark: marks[i] }))
			.filter((m) => m.mark !== '' && sheetWeek.skills.includes(m.skill))
			.map((m) => ({ skill: m.skill, mark: Number(m.mark) }));
		if (!given.length && !comment) {
			return fail(400, { message: 'Give at least one mark or write a comment.' });
		}

		try {
			await db.transaction(async (tx) => {
				const [{ id }] = await tx
					.insert(studentReports)
					.values({
						enrolmentId,
						reportDate,
						week,
						weekTitle: sheetWeek.title,
						teacherName: teacherName || null,
						comment: comment || null,
						createdBy: locals.user!.id
					})
					.$returningId();
				if (given.length) {
					await tx.insert(studentReportMarks).values(given.map((m) => ({ ...m, reportId: id })));
				}
			});
		} catch (err) {
			console.error('Error saving report:', err instanceof Error ? err.message : err);
			return fail(500, { message: "The report couldn't be saved." });
		}
		return { message: 'Report saved' };
	},

	// Bulk actions on the students ticked in the table

	// Email each student their report for a week or date range, PDF attached
	bulkReport: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const formData = await request.formData();
		const parsed = bulkReport.safeParse({
			...Object.fromEntries(formData),
			enrolmentIds: formData.getAll('enrolmentId')
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		if (!mailConfigured()) return fail(500, { message: 'Email is not set up yet.' });
		const { enrolmentIds, from, to } = parsed.data;

		return forEachStudent(enrolmentIds, 'reports emailed', (id) =>
			emailStudentReport(id, from, to)
		);
	},

	bulkDelete: async ({ request, locals }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const parsed = bulkStudents.safeParse({
			enrolmentIds: (await request.formData()).getAll('enrolmentId')
		});
		if (!parsed.success) return fail(400, { message: 'Select at least one student.' });

		return forEachStudent(parsed.data.enrolmentIds, 'deleted', deleteEnrolment);
	},

	bulkPayment: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const formData = await request.formData();
		const parsed = bulkPayment.safeParse({
			...Object.fromEntries(formData),
			enrolmentIds: formData.getAll('enrolmentId')
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		const { enrolmentIds, status, paymentWayId } = parsed.data;
		const staff = locals.user;

		return forEachStudent(
			enrolmentIds,
			status === 'paid' ? 'marked as paid' : status === 'unpaid' ? 'marked as unpaid' : 'cancelled',
			(id) => applyPayment(id, status, paymentWayId, staff, url.origin)
		);
	},

	bulkEmail: async ({ request, locals, url }) => {
		if (!locals.user) return fail(401, { message: 'Please log in again.' });
		const formData = await request.formData();
		const parsed = bulkEmail.safeParse({
			...Object.fromEntries(formData),
			enrolmentIds: formData.getAll('enrolmentId')
		});
		if (!parsed.success) {
			return fail(400, { message: parsed.error.issues[0]?.message ?? 'Please check the form.' });
		}
		if (!mailConfigured()) return fail(500, { message: 'Email is not set up yet.' });
		const { enrolmentIds, email, subject, message } = parsed.data;

		if (email === 'payLink') {
			return forEachStudent(enrolmentIds, 'payment links emailed', (id) =>
				emailPayLink(id, url.origin)
			);
		}
		if (email === 'custom') {
			return forEachStudent(enrolmentIds, 'emails sent', (id) => emailCustom(id, subject, message));
		}
		if (email === 'welcome') {
			return forEachStudent(enrolmentIds, 'welcome emails sent', resendWelcomeEmail);
		}
		if (email === 'schedule') {
			return forEachStudent(enrolmentIds, 'class schedules emailed', emailClassSchedule);
		}
		return forEachStudent(enrolmentIds, 'class links emailed', (id) =>
			emailClassLink(id, url.origin)
		);
	}
};
