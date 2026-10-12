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
		status: z.enum(['paid', 'unpaid']).default('unpaid'),
		// How they paid (Bank Transfer, Cash...), as a string matching the select's
		// values; only for paid students
		paymentWayId: z.string().default('')
	})
	.refine((d) => d.status === 'paid' || d.amount > 0, {
		message: 'Enter the amount the student needs to pay',
		path: ['amount']
	})
	.refine((d) => d.status !== 'paid' || /^\d+$/.test(d.paymentWayId), {
		message: 'Choose how the student paid',
		path: ['paymentWayId']
	});

export type RegisterStudent = typeof registerStudent;

export const sendLink = z.object({
	enrolmentId: z.coerce.number().int().positive()
});

// Record how and whether a student paid. Never for Stripe payments, which are set automatically.
export const setPayment = z
	.object({
		enrolmentId: z.coerce.number().int().positive(),
		status: z.enum(['paid', 'unpaid', 'cancelled'], 'Choose a status'),
		paymentWayId: z.string().default('')
	})
	.refine((d) => d.status !== 'paid' || /^\d+$/.test(d.paymentWayId), {
		message: 'Choose how the student paid',
		path: ['paymentWayId']
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

// Fix a student's contact details; course and payment are changed another way
export const editStudent = z.object({
	enrolmentId: z.coerce.number().int().positive(),
	firstName: z
		.string('First Name is Required')
		.trim()
		.min(2, 'First Name must be at least 2 characters')
		.max(255, 'First Name is too long'),
	lastName: z
		.string('Last Name is Required')
		.trim()
		.min(2, 'Last Name must be at least 2 characters')
		.max(255, 'Last Name is too long'),
	email: z.email('A valid email is required').trim().max(255, 'Email is too long'),
	phone: z.string().trim().max(15, 'Phone number must be at most 15 characters').default('')
});

export const addNotificationEmail = z.object({
	email: z.email('Enter a valid email address').trim().toLowerCase().max(255, 'Email is too long')
});

export const removeNotificationEmail = z.object({
	id: z.coerce.number().int().positive()
});
