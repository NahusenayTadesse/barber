import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { enrolments as customers, courses } from '$lib/server/db/schema';
import { eq, and, count, sql, ne } from 'drizzle-orm';
import { setFlash } from 'sveltekit-flash-message/server';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { addCustomer } from '$lib/ZodSchema';
import { zod4 } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
	const form = await superValidate(zod4(addCustomer));
	const customersList = await db
		.select({
			id: customers.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${customers.firstName}, ${customers.lastName}))`,
			email: customers.email,
			phone: customers.phone,
			paymentRaw: customers.paymentOption,
			paymentOption: sql<number>`
            CASE
                WHEN ${customers.paymentOption} = 'minPrice'
                    THEN FLOOR(${courses.minPrice})
                WHEN ${customers.paymentOption} = 'threeEqual'
                    THEN FLOOR(${courses.basePrice} / 3)
                WHEN ${customers.paymentOption} = 'basePrice'
                    THEN FLOOR(${courses.basePrice})
                ELSE 0
            END`.mapWith(Number),
			course: courses.name,
			basePrice: courses.basePrice,
			minPrice: courses.minPrice,
			status: customers.status,
			enrolledAt: sql<string>`DATE_FORMAT(${customers.createdAt}, '%Y-%m-%d')`
		})
		.from(customers)
		.leftJoin(courses, eq(customers.courseId, courses.id))
		.groupBy(
			customers.id,
			customers.createdAt,
			customers.firstName,
			customers.lastName,
			courses.name,
			customers.paymentOption,
			customers.email,
			customers.phone,
			courses.basePrice,
			courses.minPrice
		);

	return {
		customersList
	};
};

export const actions: Actions = {
	addCustomer: async ({ request, locals, cookies }) => {
		const form = await superValidate(request, zod4(addCustomer));

		if (!form.valid) {
			// Stay on the same page and set a flash message
			setFlash({ type: 'error', message: 'Please check your form.' }, cookies);
			return fail(400, { form });
		}
		const { firstName, lastName, gender, phone } = form.data;

		try {
			await db.insert(customers).values({
				name,
				phone,
				createdBy: locals?.user?.id
			});

			// Stay on the same page and set a flash message
			setFlash({ type: 'success', message: 'Customer Successfully Added' }, cookies);
			return {
				form
			};
		} catch (err) {
			console.error('Error' + err);
			setFlash(
				{
					type: 'error',
					message:
						err.code === 'ER_DUP_ENTRY'
							? 'Phone number is already taken. Please choose another one.'
							: err.message
				},
				cookies
			);

			if (err.code === 'ER_DUP_ENTRY')
				return setError(form, 'phone', 'Phone Number already exists.');

			return fail(400, {
				form
			});
		}
	}
};
