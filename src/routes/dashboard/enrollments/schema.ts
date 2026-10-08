import { z } from 'zod/v4';

export const registerStudent = z
	.object({
		firstName: z
			.string('First Name is Required')
			.trim()
			.min(2, 'First Name must be at least 2 characters'),
		lastName: z
			.string('Last Name is Required')
			.trim()
			.min(2, 'Last Name must be at least 2 characters'),
		email: z.email('A valid email is required'),
		phone: z.string().trim().max(15, 'Phone number must be at most 15 characters').default(''),
		// Course id as a string, matching the select's values
		courseId: z.string('Course is Required').regex(/^\d+$/, 'Course is Required'),
		// Method id as a string, matching the select's values
		paymentMethodId: z
			.string('Please select a payment option')
			.regex(/^\d+$/, 'Please select a payment option'),
		amount: z.coerce.number('Amount is required').min(0, 'Amount cannot be negative'),
		status: z.enum(['paid', 'unpaid']).default('unpaid')
	})
	.refine((d) => d.status === 'paid' || d.amount > 0, {
		message: 'Enter the amount the student needs to pay',
		path: ['amount']
	});

export type RegisterStudent = typeof registerStudent;

export const sendLink = z.object({
	enrolmentId: z.coerce.number().int().positive()
});
