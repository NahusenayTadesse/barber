import type { RequestHandler } from './$types';

// Generated (not a static file) so the Sitemap line has the site's own address
export const GET: RequestHandler = ({ url }) =>
	new Response(
		[
			'User-agent: *',
			'Disallow: /dashboard',
			'Disallow: /login',
			'Disallow: /api/',
			'Disallow: /courses/success',
			'Disallow: /pay/',
			'Disallow: /certificates/',
			'',
			`Sitemap: ${url.origin}/sitemap.xml`,
			''
		].join('\n'),
		{
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'public, max-age=3600'
			}
		}
	);
