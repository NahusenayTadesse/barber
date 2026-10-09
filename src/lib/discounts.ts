// Shared (client + server) helpers for course discounts.

export type Gender = 'male' | 'female';

/** Who a gender-only discount is for, as said on the website. */
export const genderAudience: Record<Gender, string> = { male: 'men', female: 'women' };

// Sent to the public site, so it deliberately has no dates: customers are
// never told when a discount ends.
export type ActiveDiscount = {
	id: number;
	name: string;
	percentage: number;
	/** Only for students of this gender; null = everyone */
	gender: Gender | null;
};

/**
 * The biggest discount a student of this gender gets. Without a gender, only
 * discounts for everyone count.
 */
export function bestDiscount(
	discounts: ActiveDiscount[],
	gender?: Gender | '' | null
): ActiveDiscount | undefined {
	let best: ActiveDiscount | undefined;
	for (const d of discounts) {
		if (d.gender && d.gender !== gender) continue;
		if (!best || d.percentage > best.percentage) best = d;
	}
	return best;
}

/** Gender-only discounts bigger than the one everyone gets (the best per gender), to advertise. */
export function genderOffers(discounts: ActiveDiscount[]): ActiveDiscount[] {
	const base = bestDiscount(discounts)?.percentage ?? 0;
	return (['female', 'male'] as const)
		.map((g) => bestDiscount(discounts, g))
		.filter((d): d is ActiveDiscount => !!d?.gender && d.percentage > base);
}

export type BannerDiscount = {
	name: string;
	percentage: number;
	/** "all courses", a single course's name, or "selected courses" */
	courseLabel: string;
	/** True when other live discounts exist besides the one shown */
	more: boolean;
	/** UK date the discount ends, e.g. "8 November 2026" (shown in the popup only) */
	endsOn: string;
	/** Only for students of this gender; null = everyone */
	gender: Gender | null;
};

export type DiscountStatus = 'Active' | 'Scheduled' | 'Expired' | 'Disabled';

/** Apply a percentage discount to a price, rounded to whole pence. */
export function applyDiscount(price: number | string | null | undefined, percentage = 0): number {
	const amount = Number(price ?? 0);
	if (!percentage) return amount;
	return Math.round(amount * (1 - percentage / 100) * 100) / 100;
}

/** Where a discount sits on its timeline right now. */
export function discountStatus(
	d: { isActive: boolean; startsAt: Date | string; expiresAt: Date | string },
	now = new Date()
): DiscountStatus {
	if (!d.isActive) return 'Disabled';
	if (new Date(d.expiresAt) <= now) return 'Expired';
	if (new Date(d.startsAt) > now) return 'Scheduled';
	return 'Active';
}

// --- Payment methods ---

export type PaymentMethodKind = 'full' | 'instalments' | 'deposit';

/** A payment method as offered on a course (sent to the website). */
export type PaymentMethod = {
	id: number;
	name: string;
	kind: PaymentMethodKind;
	instalments: number | null;
	percentOff: number;
	/** Lines shown on the payment card */
	lines: string[];
};

export const paymentMethodKindLabels: Record<PaymentMethodKind, string> = {
	full: 'Pay in Full',
	instalments: 'Instalments',
	deposit: 'Deposit (course minimum price)'
};

/**
 * Amount due today for a payment method, after the course discount and the
 * method's own % off. 0 means the method can't be used for this course
 * (e.g. a deposit on a course with no minimum price).
 */
export function methodAmountFor(
	course: { basePrice: number | string; minPrice: number | string | null } | undefined,
	method: Pick<PaymentMethod, 'kind' | 'instalments' | 'percentOff'> | undefined,
	coursePercentage = 0
): number {
	if (!course || !method) return 0;
	const price = applyDiscount(applyDiscount(course.basePrice, coursePercentage), method.percentOff);
	switch (method.kind) {
		case 'full':
			return Math.floor(price);
		case 'instalments':
			return Math.floor(price / Math.max(method.instalments ?? 1, 1));
		case 'deposit':
			return Math.floor(
				applyDiscount(applyDiscount(course.minPrice, coursePercentage), method.percentOff)
			);
	}
}

/** " × 3" after an instalment amount, nothing otherwise. */
export const amountSuffix = (method: Pick<PaymentMethod, 'kind' | 'instalments'>) =>
	method.kind === 'instalments' && method.instalments ? ` × ${method.instalments}` : '';
