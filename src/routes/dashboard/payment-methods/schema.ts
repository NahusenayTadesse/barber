import { z } from 'zod/v4';

const fields = {
	name: z.string('Name is required').trim().min(2, 'Name is required').max(100),
	kind: z.enum(['full', 'instalments', 'deposit'], 'Choose how this method charges'),
	instalments: z.coerce
		.number()
		.int()
		.min(2, 'At least 2 instalments')
		.max(24)
		.nullable()
		.default(null),
	percentOff: z.coerce
		.number()
		.min(0, "Can't be negative")
		.max(100, 'Cannot be more than 100')
		.default(0),
	description: z.string().max(1000).default(''),
	sortOrder: z.coerce.number().int().default(0),
	// Course ids as strings, matching the checkbox values
	courseIds: z.array(z.string()).default([]),
	isActive: z.boolean().default(true)
};

const instalmentsSet = (d: { kind: string; instalments: number | null }) =>
	d.kind !== 'instalments' || (d.instalments ?? 0) >= 2;
const instalmentsMessage = {
	message: 'Enter how many instalments (2 or more)',
	path: ['instalments']
};

export const add = z.object(fields).refine(instalmentsSet, instalmentsMessage);

export const edit = z
	.object({ id: z.coerce.number().int(), ...fields })
	.refine(instalmentsSet, instalmentsMessage);

export const deleteMethod = z.object({
	id: z.coerce.number()
});

export type AddMethod = typeof add;
export type EditMethod = typeof edit;
