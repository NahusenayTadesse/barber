import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { contactSchema } from './contact/schema';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {

	redirect(303, '/courses')
	const form = await superValidate(zod4(contactSchema));

	return {
		form
	};
};
