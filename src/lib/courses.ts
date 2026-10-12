// Shared (client + server) helpers for who a course is for.

/** Whose hair a course teaches you to style, in the order the website lists them. */
export const audiences = ['men', 'women'] as const;
export type Audience = (typeof audiences)[number];

export const audienceLabels: Record<Audience, string> = { men: "Men's", women: "Women's" };

/** Select items for choosing a course's audience. */
export const audienceItems = audiences.map((value) => ({
	value,
	name: `${audienceLabels[value]} hair`
}));

/** "Fade Masterclass (Women's)" — tells apart a men's and women's course of the same name. */
export const courseLabel = (c: { name: string; audience: Audience }) =>
	`${c.name} (${audienceLabels[c.audience]})`;

/** The men's / women's view picked with ?for=men or ?for=women; null shows everything. */
export function audienceParam(url: URL): Audience | null {
	const value = url.searchParams.get('for');
	return audiences.find((a) => a === value) ?? null;
}

/** Men's courses first, then women's; the order within each is kept. */
export const byAudience = (a: { audience: Audience }, b: { audience: Audience }) =>
	audiences.indexOf(a.audience) - audiences.indexOf(b.audience);
