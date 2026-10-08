import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';

const PAGES = [
	{ path: '/courses', priority: '1.0' },
	{ path: '/barber-shop', priority: '0.8' },
	{ path: '/haircuts', priority: '0.8' },
	{ path: '/contact', priority: '0.6' }
];

export const GET: RequestHandler = async ({ url }) => {
	const active = await db
		.select({ id: courses.id, updatedAt: courses.updatedAt })
		.from(courses)
		.where(eq(courses.isActive, true));

	const entries = [
		...PAGES.map((p) => ({ loc: url.origin + p.path, priority: p.priority, lastmod: null })),
		...active.map((c) => ({
			loc: `${url.origin}/courses/${c.id}`,
			priority: '0.9',
			lastmod: c.updatedAt.toISOString().slice(0, 10)
		}))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
	.map(
		(e) =>
			`	<url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<priority>${e.priority}</priority></url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
