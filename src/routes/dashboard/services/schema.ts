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
export type AddService = z.infer<typeof add>;

export const add = z.object({
	name: z.string('Name of Payment Method is required').min(2).max(50),
	price: z.number('Price is required'),
	description: z.string().optional(),
	bookingLink: z.url('Booking link is required'),
	imageUrl: z.file('Photo is required').max(10000000)
});

export const edit = z.object({
	id: z.coerce.number(),
	name: z.string('Name of Payment Method is required').min(2).max(50),
	price: z.number('Price is required'),
	description: z.string().optional(),
	bookingLink: z.url('Booking link is required'),
	imageUrl: z.file('Photo is required').max(10000000).optional()
});

export type EditService = z.infer<typeof edit>;

export const deleteService = z.object({
	id: z.coerce.number()
});

export type deleteService = z.infer<typeof deleteService>;
