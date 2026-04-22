import { z } from 'zod/v4';

export const edit = z.object({
	name: z.string().min(1, 'Course Name is required.'),
	level: z.string().optional(),
	duration: z.string().optional(),
	basePrice: z.coerce.number('Base Price is required'),
	minPrice: z.coerce.number('Minimum Price is required'),
	minPriceMessage: z.string().optional(),
	target: z.string().optional(),
	experience: z.string().optional(),

	description: z
		.string()
		.max(500, { message: "Product description can't be more than 500 characters." })
		.optional(),
	status: z.boolean().default(true)
});
