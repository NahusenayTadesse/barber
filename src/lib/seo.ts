// Structured data (schema.org JSON-LD) for search engines.
import { SITE_NAME } from '$lib/components/Seo.svelte';

export const BUSINESS = {
	name: SITE_NAME,
	telephone: '+442037003997',
	address: { '@type': 'PostalAddress', addressLocality: 'London', addressCountry: 'GB' },
	sameAs: [
		'https://www.instagram.com/dnd_barber_academy/',
		'https://www.tiktok.com/@dnd_barber_academy'
	]
};

type HoursRow = {
	dayLabel: string;
	isClosed: boolean;
	opensLabel: string | null;
	closesLabel: string | null;
};

/** "9AM" / "6:30PM" / "12AM" -> "09:00" / "18:30" / "00:00"; null if unreadable. */
function to24h(label: string | null): string | null {
	const m = label?.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
	if (!m) return null;
	let h = Number(m[1]) % 12;
	if (m[3].toUpperCase() === 'PM') h += 12;
	return `${String(h).padStart(2, '0')}:${m[2] ?? '00'}`;
}

/** Opening hours from the dashboard's Opening Hours, for schema.org. */
export function openingHours(rows: HoursRow[]) {
	return rows.flatMap((r) => {
		const opens = to24h(r.opensLabel);
		const closes = to24h(r.closesLabel);
		if (r.isClosed || !opens || !closes) return [];
		return [
			{
				'@type': 'OpeningHoursSpecification',
				dayOfWeek: `https://schema.org/${r.dayLabel}`,
				opens,
				// Closing at midnight is written as 23:59 so it stays on the same day
				closes: closes === '00:00' ? '23:59' : closes
			}
		];
	});
}

/** The business as a barber shop + training provider. */
export function businessJsonLd(origin: string, hours: HoursRow[]) {
	return {
		'@context': 'https://schema.org',
		'@type': ['BarberShop', 'EducationalOrganization'],
		'@id': `${origin}/#business`,
		...BUSINESS,
		url: `${origin}/courses`,
		logo: `${origin}/logo.jpeg`,
		image: `${origin}/og-image.jpg`,
		openingHoursSpecification: openingHours(hours)
	};
}

type CourseRow = {
	id: number;
	name: string;
	description: string | null;
	basePrice: string;
	duration: string | null;
	level: string | null;
};

/** One course, with its current price (after any live discount). */
export function courseJsonLd(origin: string, c: CourseRow, price: number) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Course',
		name: c.name,
		description: c.description?.replace(/\s+/g, ' ').trim() || `${c.name} at ${SITE_NAME}, London.`,
		url: `${origin}/courses/${c.id}`,
		provider: {
			'@type': 'Organization',
			'@id': `${origin}/#business`,
			name: SITE_NAME,
			url: origin
		},
		...(c.level && { educationalLevel: c.level }),
		offers: {
			'@type': 'Offer',
			category: 'Paid',
			price: price.toFixed(2),
			priceCurrency: 'GBP',
			availability: 'https://schema.org/InStock',
			url: `${origin}/courses/${c.id}`
		},
		hasCourseInstance: {
			'@type': 'CourseInstance',
			courseMode: 'Onsite',
			location: { '@type': 'Place', name: SITE_NAME, address: BUSINESS.address },
			...(c.duration && { courseWorkload: c.duration })
		}
	};
}
