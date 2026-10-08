import { z } from 'zod/v4';

export const issueCertificate = z.object({
	// Enrolment id as a string, matching the select's values; '' when issued without one
	enrolmentId: z.string().regex(/^\d*$/).default(''),
	title: z.string('Title is required').trim().min(3, 'Title is required').max(100),
	studentName: z
		.string("Student's name is required")
		.trim()
		.min(2, "Student's name is required")
		.max(120),
	courseName: z.string('Course is required').trim().min(2, 'Course is required').max(200),
	courseDetails: z.string().trim().max(200).default(''),
	completedOn: z
		.string('Completion date is required')
		.regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date'),
	signatoryName: z.string().trim().max(120).default(''),
	signatoryRole: z.string().trim().max(120).default('')
});

export const certificateId = z.object({
	id: z.coerce.number().int().positive()
});

export type IssueCertificate = typeof issueCertificate;
