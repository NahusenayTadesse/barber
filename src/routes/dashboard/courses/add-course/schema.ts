import { z } from 'zod/v4';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB limit
const ACCEPTED_FILE_TYPES = [
	'image/jpeg', // Common for both platforms
	'image/png', // Common for both platforms (and screenshots)
	'image/webp', // Common modern format (often Android screenshots/exports)
	'image/heic', // High Efficiency Image File (iOS default)
	'image/heif', // High Efficiency Image File (related to HEIC)
	'application/pdf' // Document format, kept from original
];

export const add = z.object({
	name: z.string().min(1, 'Course Name is required.'),
	level: z.string().optional(),
	duration: z.string().optional(),
	basePrice: z.number('Base Price is required'),
	minPrice: z.number('Minimum Price is required'),
	minPriceMessage: z.string().optional(),
	target: z.string().optional(),
	experience: z.string().optional(),

	description: z
		.string()
		.max(500, { message: "Product description can't be more than 500 characters." })
		.optional()
});
