import { z } from 'zod/v4';
export const schema = z.object({
	name: z.string('Name is Required').min(2, 'Name must be at least 2 characters'),
	email: z.email('Email is required'),
	phone: z
		.string()
		.min(10, 'Phone number must be at least 10 characters')
		.max(15, 'Phone number must be at most 15 characters'),
	prefferedStyle: z.string('Preffered style is required'),
	prefferedTime: z.string('Availability is required'),
	contactMessage: z.string().optional()
});
