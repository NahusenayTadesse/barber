import { json, redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	return svelteKitHandler({ event, resolve, auth, building });
};

/**
 * Protect everything under /dashboard, including form actions. The dashboard
 * layout's load only runs for page loads, never for POSTs, so it can't do this.
 */
const guardDashboard: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

	if (isDashboard && !event.locals.user) {
		// Form actions submitted with use:enhance expect an ActionResult, not a page
		if (event.request.headers.get('x-sveltekit-action') === 'true') {
			return json({ type: 'redirect', status: 303, location: '/login' });
		}
		if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
			return new Response('Unauthorized', { status: 401 });
		}
		redirect(303, '/login');
	}

	return resolve(event);
};

/**
 * Certificate links typed by hand from a printed certificate may be in capitals
 * (/CERTIFICATES/DDBA-...); send them to the real lowercase address.
 */
const certificateLinks: Handle = async ({ event, resolve }) => {
	const { pathname, search } = event.url;
	if (/^\/certificates\//i.test(pathname) && !pathname.startsWith('/certificates/')) {
		redirect(308, '/certificates/' + pathname.slice('/certificates/'.length) + search);
	}
	return resolve(event);
};

export const handle: Handle = sequence(certificateLinks, handleBetterAuth, guardDashboard);
