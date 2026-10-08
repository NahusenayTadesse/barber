import { z } from 'zod/v4';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const editGallery = z.object({
	existing: z.string(),
	images: z
		.file()
		.max(10_000_000, 'Each image must be under 10 MB')
		.mime(IMAGE_TYPES, 'Only JPG, PNG, WebP or AVIF images can be uploaded')
		.array()
		.max(30, 'Upload at most 30 images at a time')
		.optional()
});
