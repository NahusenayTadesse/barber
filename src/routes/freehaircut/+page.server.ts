import { superValidate, message } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { schema } from './schema';
import { db } from '$lib/server/db';
import { haircutRequests } from '$lib/server/db/schema';

import type { PageServerLoad, Actions } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return error(404, 'Not Found');
	const form = await superValidate(zod4(schema));

	return {
		form
	};
};

export const actions: Actions = {
	freehaircut: async ({ request }) => {
		const form = await superValidate(request, zod4(schema));
		if (!form.valid) {
			return message(form, { type: 'error', text: 'Please check the form for Errors' });
		}

		const { name, phone, email, prefferedStyle, prefferedTime, contactMessage } = form.data;

		try {
			await db.insert(haircutRequests).values({
				clientName: name,
				clientPhone: phone,
				clientEmail: email,
				prefferedStyle,
				prefferedTime,
				message: contactMessage
			});

			return message(form, { type: 'success', text: 'Haircut Request Successfully Sent!' });
		} catch (err) {
			console.error('Error saving haircut request:', err);
			return message(form, {
				type: 'error',
				text: "Sorry, your request couldn't be sent. Please try again or call us."
			});
		}
	}
};
