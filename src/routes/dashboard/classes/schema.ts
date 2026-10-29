import { z } from 'zod/v4';

const isoDate = z.string('Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date');
const time = z.string('Time is required').regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Pick a valid time');
const optionalText = (max: number) => z.string().trim().max(max).default('');

const session = z
	.object({
		dayOfWeek: z.coerce.number().int().min(0).max(6),
		startTime: time,
		endTime: time
	})
	.refine((s) => s.endTime > s.startTime, { message: 'Each session must end after it starts' });

const classFields = z
	.object({
		courseId: z.coerce.number('Pick a course').int().positive('Pick a course'),
		name: z.string('Name of class is required').trim().min(2, 'Name is too short').max(255),
		startDate: isoDate,
		endDate: z.union([z.literal(''), isoDate]).default(''),
		location: optionalText(255),
		instructor: optionalText(255),
		// Blank means no limit
		capacity: z.preprocess(
			(v) => (v === '' || v == null ? null : v),
			z.coerce
				.number()
				.int('Capacity must be a whole number')
				.min(1, 'Capacity must be at least 1')
				.max(1000)
				.nullable()
		),
		notes: optionalText(2000),
		// Checkbox: present ("on") when ticked
		isActive: z.preprocess((v) => v === 'on' || v === 'true', z.boolean()),
		// Posted as JSON from the session rows
		sessions: z.preprocess(
			(v) => {
				try {
					return JSON.parse(String(v));
				} catch {
					return v;
				}
			},
			z.array(session, 'Add at least one session').min(1, 'Add at least one session')
		)
	})
	.refine((c) => !c.endDate || c.endDate >= c.startDate, {
		message: 'End date must be on or after the start date'
	});

export const addClass = classFields;

export const editClass = z.intersection(
	z.object({ id: z.coerce.number().int().positive() }),
	classFields
);

export const classId = z.object({ id: z.coerce.number().int().positive() });

export const assignStudent = z.object({
	classId: z.coerce.number().int().positive(),
	enrolmentId: z.coerce.number().int().positive('Pick a student')
});

export const removeStudent = z.object({
	enrolmentId: z.coerce.number().int().positive()
});
