import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { contactSchema } from '../contact/schema';
import type { PageServerLoad } from './$types';

import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return error(404, 'Not Found');
	const form = await superValidate(zod4(contactSchema));

	return {
		form
	};
};
