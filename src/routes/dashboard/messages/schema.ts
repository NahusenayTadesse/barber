import { z } from 'zod/v4';

export const deleteMessage = z.object({
	id: z.coerce.number()
});

export type DeleteMessage = z.infer<typeof deleteMessage>;
