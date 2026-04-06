import { z } from 'zod/v4';
export const contactSchema = z.object({
	name: z.string('Name is Required').min(2, 'Name must be at least 2 characters'),
	email: z.email('Email is required'),
	phone: z
		.string()
		.min(10, 'Phone number must be at least 10 characters')
		.max(15, 'Phone number must be at most 15 characters'),
	subject: z.string().min(3, 'Subject must be at least 3 characters'),
	contactMessage: z.string().optional()
});
