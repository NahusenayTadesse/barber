import { z } from 'zod/v4';
export const schema = z.object({
	firstName: z.string('First Name is Required').min(2, 'First Name must be at least 2 characters'),
	lastName: z.string('Last Name is Required').min(2, 'Last Name must be at least 2 characters'),
	email: z.email('Email is required'),
	courseId: z.number('Course is Required'),
	phone: z
		.string()
		.min(10, 'Phone number must be at least 10 characters')
		.max(15, 'Phone number must be at most 15 characters'),
	paymentOption: z
		.string('Please Select a Payment Option')
		.nonempty('Please Select a Payment Option')
});
