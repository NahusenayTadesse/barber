import { z } from 'zod/v4';

const isoDate = z.string('Date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a valid date');

const fields = {
	name: z.string('Name of discount is required').trim().min(2).max(100),
	percentage: z.coerce
		.number('Percentage is required')
		.gt(0, 'Percentage must be more than 0')
		.max(100, 'Percentage cannot be more than 100'),
	// Who gets it: '' = everyone, or one gender only
	gender: z.enum(['male', 'female', '']).default(''),
	// Course ids as strings, matching the checkbox values
	courseIds: z.array(z.string()).min(1, 'Select at least one course'),
	startsAt: isoDate,
	expiresAt: isoDate,
	isActive: z.boolean().default(true)
};

const datesInOrder = (d: { startsAt: string; expiresAt: string }) => d.expiresAt >= d.startsAt;
const datesMessage = {
	message: 'Expiration date must be on or after the start date',
	path: ['expiresAt']
};

export const add = z.object(fields).refine(datesInOrder, datesMessage);

export const edit = z
	.object({ id: z.coerce.number().int(), ...fields })
	.refine(datesInOrder, datesMessage);

export const deleteDiscount = z.object({
	id: z.coerce.number()
});

export type AddDiscount = typeof add;
export type EditDiscount = typeof edit;
