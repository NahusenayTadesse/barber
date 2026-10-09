import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { and, eq } from 'drizzle-orm';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { courses, enrolments } from '$lib/server/db/schema';
import type { PageServerLoad, Actions } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getActiveDiscounts, getCourseDiscounts } from '$lib/server/discounts';
import { methodAmountFor } from '$lib/discounts';
import { getCourseMethods } from '$lib/server/paymentMethods';
import { stripe } from '$lib/server/stripe';

const activeCourse = (id: number) => and(eq(courses.id, id), eq(courses.isActive, true));

export const load: PageServerLoad = async ({ params }) => {
	const { id } = params;
	const form = await superValidate(zod4(schema));

	const course = await db
		.select({ id: courses.id, name: courses.name })
		.from(courses)
		.where(activeCourse(Number(id)))
		.limit(1)
		.then((res) => res[0]);

	if (!course) {
		error(404, 'Course not found');
	}

	const allCourses = await db.select().from(courses).where(eq(courses.isActive, true));
	const discounts = await getCourseDiscounts(allCourses.map((c) => c.id));
	const methods = await getCourseMethods(allCourses.map((c) => c.id));
	const coursesList = allCourses.map((c) => ({
		...c,
		// The page picks the best one for the gender the student chooses
		discounts: discounts[c.id] ?? [],
		// Only methods that work for this course (a deposit needs a minimum price)
		methods: (methods[c.id] ?? []).filter((m) => methodAmountFor(c, m) > 0)
	}));

	form.data.courseId = Number(id);

	return {
		form,
		course,
		coursesList
	};
};

export const actions: Actions = {
	enroll: async ({ request, url }) => {
		const form = await superValidate(request, zod4(schema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { firstName, lastName, gender, phone, email, courseId, paymentMethodId } = form.data;

		// Price the enrolment from the database, never from the submitted amount,
		// so the discount (and the price itself) can't be tampered with.
		const course = await db
			.select({
				id: courses.id,
				name: courses.name,
				basePrice: courses.basePrice,
				minPrice: courses.minPrice
			})
			.from(courses)
			.where(activeCourse(courseId))
			.then((res) => res[0]);
		const discount = course
			? (await getActiveDiscounts([course.id], gender || null))[course.id]
			: undefined;
		// Only a method this course offers
		const method = course
			? (await getCourseMethods([course.id]))[course.id]?.find((m) => m.id === paymentMethodId)
			: undefined;
		const paymentAmount = methodAmountFor(course, method, discount?.percentage);

		if (!course || !method || paymentAmount <= 0) {
			return message(
				form,
				{ type: 'error', text: 'Please select a valid course and payment option' },
				{ status: 400 }
			);
		}

		let enrolmentId: number | undefined;
		let checkoutUrl: string | null = null;

		try {
			// Saved as "pending"; it becomes "confirmed" only once Stripe reports it paid
			[{ id: enrolmentId }] = await db
				.insert(enrolments)
				.values({
					firstName,
					lastName,
					gender: gender || null,
					phone,
					email,
					courseId,
					course: course.name,
					paymentMethodId: method.id,
					paymentOption: method.name,
					amount: String(paymentAmount),
					discountName: discount?.name ?? null,
					discountPercentage: discount ? String(discount.percentage) : null
				})
				.$returningId();

			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				customer_email: email,
				client_reference_id: String(enrolmentId),
				metadata: {
					enrolmentId: String(enrolmentId),
					courseId: String(course.id),
					paymentOption: method.name,
					discount: discount ? `${discount.name} (${discount.percentage}%)` : ''
				},
				line_items: [
					{
						price_data: {
							currency: 'gbp',
							product_data: {
								name: `${course.name} — ${method.name}`,
								...(discount && {
									description: `${discount.name}: ${discount.percentage}% off`
								})
							},
							unit_amount: Math.round(paymentAmount * 100)
						},
						quantity: 1
					}
				],
				success_url: `${url.origin}/courses/success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${url.origin}/courses/${course.id}?cancelled=1`
			});

			await db
				.update(enrolments)
				.set({ stripeSessionId: session.id })
				.where(eq(enrolments.id, enrolmentId));
			checkoutUrl = session.url;
		} catch (err) {
			console.error('Checkout failed:', err instanceof Error ? err.message : err);
		}

		if (!checkoutUrl) {
			// Don't leave an enrolment behind for a checkout that never started
			if (enrolmentId) {
				await db
					.delete(enrolments)
					.where(eq(enrolments.id, enrolmentId))
					.catch(() => {});
			}
			return message(
				form,
				{
					type: 'error',
					text: "We couldn't start the payment. Please try again, or call us on 020 3700 3997."
				},
				{
					status: 500
				}
			);
		}

		redirect(303, checkoutUrl);
	}
};
