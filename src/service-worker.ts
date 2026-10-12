/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * Dashboard-only service worker. It is registered by the dashboard layout with
 * scope /dashboard (auto-registration is off in svelte.config.js), so the public
 * site never runs it.
 *
 * Dashboard pages and their data are private and change constantly, so they are
 * never cached: only content-hashed build files and the app icons are. Offline
 * navigations get a small "you're offline" page instead of stale student data.
 */
import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `dashboard-${version}`;
const PRECACHE = files.filter((file) => file.startsWith('/pwa/'));
const IMMUTABLE = new Set(build);

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(PRECACHE))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})()
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	// Build output never changes under the same name, so cache it on first use
	if (IMMUTABLE.has(url.pathname) || PRECACHE.includes(url.pathname)) {
		event.respondWith(
			(async () => {
				const cache = await caches.open(CACHE);
				const cached = await cache.match(url.pathname);
				if (cached) return cached;
				const response = await fetch(request);
				if (response.ok) void cache.put(url.pathname, response.clone());
				return response;
			})()
		);
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(fetch(request).catch(() => offlinePage()));
	}
});

function offlinePage() {
	const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0c0c0c" />
<title>Offline</title>
<style>
	body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #0c0c0c;
		color: #f0ede4; font-family: system-ui, sans-serif; text-align: center; padding: 1.5rem; box-sizing: border-box; }
	img { width: 96px; height: 96px; border-radius: 22px; }
	h1 { font-size: 1.25rem; margin: 1.25rem 0 0.5rem; }
	p { color: #a3a3a3; margin: 0 0 1.5rem; line-height: 1.5; }
	button { background: #d4af37; color: #0c0c0c; border: 0; border-radius: 9999px; padding: 0.75rem 1.5rem;
		font-size: 1rem; font-weight: 600; }
</style>
</head>
<body>
	<main>
		<img src="/pwa/icon-192.png" alt="" />
		<h1>You're offline</h1>
		<p>The dashboard needs an internet connection<br />to show up-to-date students and messages.</p>
		<button onclick="location.reload()">Try again</button>
	</main>
</body>
</html>`;
	return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
