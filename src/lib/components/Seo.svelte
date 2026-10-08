<script lang="ts" module>
	export const SITE_NAME = 'D&D Barber & Academy';

	/** "Opening Day Discount: 50% off all courses until 8 November 2026." */
	export function discountLine(
		d: {
			name: string;
			percentage: number;
			courseLabel: string;
			more: boolean;
			endsOn: string;
		} | null
	): string {
		if (!d) return '';
		const what = d.more
			? `up to ${d.percentage}% off selected courses`
			: `${d.percentage}% off ${d.courseLabel}`;
		return `${d.name}: ${what} until ${d.endsOn}.`;
	}
</script>

<script lang="ts">
	import { page } from '$app/state';

	let {
		title,
		description,
		image,
		imageAlt,
		type = 'website',
		noindex = false,
		jsonLd
	}: {
		/** Page title; the site name is added after it */
		title?: string;
		description?: string;
		/** Absolute or root-relative image URL; defaults to the site's link-preview image */
		image?: string;
		imageAlt?: string;
		type?: 'website' | 'article';
		/** Keep the page out of search results (login, dashboard, payment pages) */
		noindex?: boolean;
		/** Structured data for search engines (schema.org) */
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	} = $props();

	const origin = $derived(page.url.origin);
	const fullTitle = $derived(title ? `${title} | ${SITE_NAME}` : SITE_NAME);
	const canonical = $derived(origin + page.url.pathname);
	const imageUrl = $derived.by(() => {
		const src = image ?? '/og-image.jpg';
		return src.startsWith('http') ? src : origin + src;
	});
	const alt = $derived(imageAlt ?? `${SITE_NAME}: Learn to cut. Get paid.`);

	// Escape "<" so the JSON can't close the script tag early
	const ldJson = $derived(jsonLd ? JSON.stringify(jsonLd).replace(/</g, '\\u003c') : '');
</script>

<svelte:head>
	<title>{fullTitle}</title>
	{#if description}<meta name="description" content={description} />{/if}
	<link rel="canonical" href={canonical} />
	<meta
		name="robots"
		content={noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}
	/>

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en_GB" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={fullTitle} />
	{#if description}<meta property="og:description" content={description} />{/if}
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:secure_url" content={imageUrl} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={alt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	{#if description}<meta name="twitter:description" content={description} />{/if}
	<meta name="twitter:image" content={imageUrl} />
	<meta name="twitter:image:alt" content={alt} />

	{#if ldJson}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- escaped JSON-LD, built from our own data -->
		{@html `<script type="application/ld+json">${ldJson}</script>`}
	{/if}
</svelte:head>
