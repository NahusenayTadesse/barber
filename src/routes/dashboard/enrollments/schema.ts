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
		// Optional; '' when not given
		gender: z.enum(['male', 'female', '']).default(''),
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

export const nullifyDiscount = z.object({
	enrolmentId: z.coerce.number().int().positive(),
	// What the student still has to pay now the discount is gone (0 = nothing to collect)
	amountDue: z.coerce.number('Amount is required').min(0, 'Amount cannot be negative'),
	reason: z
		.string('A reason is required')
		.trim()
		.min(5, 'Give a reason (at least 5 characters)')
		.max(1000, 'Reason is too long'),
	nullifiedOn: z.string('Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date')
});
