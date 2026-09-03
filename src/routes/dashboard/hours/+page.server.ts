import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';

import { edit } from './schema';

import { db } from '$lib/server/db';
import { businessHours } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const rows = await db.select().from(businessHours).orderBy(businessHours.sortOrder);

	const form = await superValidate({ days: rows }, zod4(edit));

	return { form };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod4(edit));

		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the hours you entered.' }, { status: 400 });
		}

		try {
			await db.transaction(async (tx) => {
				for (const day of form.data.days) {
					await tx
						.insert(businessHours)
						.values({
							dayOfWeek: day.dayOfWeek,
							dayLabel: day.dayLabel,
							sortOrder: day.sortOrder,
							isClosed: day.isClosed,
							opensLabel: day.isClosed ? null : day.opensLabel,
							closesLabel: day.isClosed ? null : day.closesLabel
						})
						.onDuplicateKeyUpdate({
							set: {
								dayLabel: day.dayLabel,
								sortOrder: day.sortOrder,
								isClosed: day.isClosed,
								opensLabel: day.isClosed ? null : day.opensLabel,
								closesLabel: day.isClosed ? null : day.closesLabel,
								updatedAt: sql`now()`
							}
						});
				}
			});

			return message(form, { type: 'success', text: 'Opening hours updated successfully' });
		} catch (err) {
			console.error('Error updating business hours:', err);
			return message(
				form,
				{ type: 'error', text: `Unexpected Error: ${err?.message}` },
				{ status: 500 }
			);
		}
	}
};
