import { z } from 'zod/v4';
import { audiences } from '$lib/courses';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB limit
const ACCEPTED_FILE_TYPES = [
	'image/jpeg', // Common for both platforms
	'image/png', // Common for both platforms (and screenshots)
	'image/webp', // Common modern format (often Android screenshots/exports)
	'image/heic', // High Efficiency Image File (iOS default)
	'image/heif', // High Efficiency Image File (related to HEIC)
	'application/pdf' // Document format, kept from original
];

// Featured image: an optional photo shown on the course card and course page
export const featuredImage = z
	.file()
	.max(10 * 1024 * 1024, 'Image must be 10MB or smaller.')
	.mime(['image/jpeg', 'image/png', 'image/webp'], 'Upload a JPG, PNG or WebP image.')
	.optional();

export const add = z.object({
	name: z.string().min(1, 'Course Name is required.'),
	// Whose hair the course teaches you to style
	audience: z.enum(audiences, 'Choose who the course is for'),
	level: z.string().optional(),
	duration: z.string().optional(),
	basePrice: z.number('Base Price is required'),
	minPrice: z.number('Minimum Price is required'),
	minPriceMessage: z.string().optional(),
	target: z.string().optional(),
	experience: z.string().optional(),
	// Payment method ids as strings, matching the checkbox values
	methodIds: z.array(z.string()).min(1, 'Choose at least one payment method'),
	featuredImage,

	description: z
		.string()
		.max(500, { message: "Product description can't be more than 500 characters." })
		.optional()
});
