import { z } from 'zod/v4';
import { audiences } from '$lib/courses';
import { featuredImage } from '../add-course/schema';

// Optional text: may be left empty (or be empty in the database already)
const optionalText = (max: number) =>
	z.string().trim().max(max, `Keep this under ${max} characters.`).nullish();

export const edit = z.object({
	name: z.string('Course Name is required.').trim().min(1, 'Course Name is required.').max(255),
	// Whose hair the course teaches you to style
	audience: z.enum(audiences, 'Choose who the course is for'),
	level: optionalText(100),
	duration: optionalText(100),
	basePrice: z.coerce.number('Base Price is required').min(0, "Base Price can't be negative."),
	// Leave empty when there's no deposit / minimum
	minPrice: z.coerce.number().min(0, "Minimum Price can't be negative.").nullish(),
	minPriceMessage: optionalText(255),
	target: optionalText(255),
	experience: optionalText(255),
	// Payment method ids as strings, matching the checkbox values. None is allowed:
	// the dashboard flags active courses that can't be paid for online.
	methodIds: z.array(z.string()).default([]),
	// Left empty, the current image is kept
	featuredImage,

	description: z
		.string()
		.max(500, { message: "Course description can't be more than 500 characters." })
		.nullish(),
	status: z.boolean().default(true)
});
