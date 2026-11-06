// Shared (client + server) helpers for a student's payment plan.

/** How far a student is through a plan of equal instalments, judged by what they've paid. */
export type PlanProgress = {
	/** Instalments in the plan, e.g. 2 */
	count: number;
	/** Each instalment's share of the course total */
	size: number;
	/** Instalments paid off completely */
	covered: number;
	/** The instalment they're paying now (1-based), or the last once all are paid */
	current: number;
	/** Paid so far towards the current instalment, when they've paid part of it */
	paidTowardsCurrent: number;
};

const pounds = (n: number) => Math.round(n * 100) / 100;

/**
 * Where a student is in their plan. Students often pay part of an instalment,
 * so progress follows the money paid, not the number of payments made.
 */
export function planProgress(
	total: number,
	paid: number,
	count: number | null
): PlanProgress | null {
	if (!count || count < 2 || total <= 0) return null;
	const size = pounds(total / count);
	// A penny's leeway, so rounding never leaves an instalment "almost" paid
	const covered = paid >= total - 0.01 ? count : Math.min(Math.floor((paid + 0.01) / size), count);
	return {
		count,
		size,
		covered,
		current: Math.min(covered + 1, count),
		paidTowardsCurrent: covered === count ? 0 : Math.max(pounds(paid - covered * size), 0)
	};
}

/** What to suggest for their next payment: the rest of the current instalment, or of the total */
export function nextPayment(left: number, progress: PlanProgress | null): number {
	if (left <= 0) return 0;
	if (!progress) return pounds(left);
	return pounds(Math.min(progress.size - progress.paidTowardsCurrent, left));
}
