import { z } from 'zod/v4';
export const contactSchema = z.object({
	firstName: z.string('First Name is Required').min(2, 'Name must be at least 2 characters'),
	lastName: z.string('Last Name is Required').min(2, 'Name must be at least 2 characters'),
	email: z.email('Email is required'),
	courseId: z.number('Course is Required'),
	phone: z
		.string()
		.min(10, 'Phone number must be at least 10 characters')
		.max(15, 'Phone number must be at most 15 characters'),
	paymentOption: z.string().min(3, 'Payment Option must be at least 3 characters')
});
