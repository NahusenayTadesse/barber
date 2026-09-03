import { z } from 'zod/v4';

const day = z.object({
	dayOfWeek: z.number().int().min(0).max(6),
	dayLabel: z.string().min(1),
	sortOrder: z.number().int().min(0).max(6),
	isClosed: z.boolean().default(false),
	opensLabel: z.string().nullable().optional(),
	closesLabel: z.string().nullable().optional()
});

export const edit = z.object({
	days: z.array(day).length(7)
});
