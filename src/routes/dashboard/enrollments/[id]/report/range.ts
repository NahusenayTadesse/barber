import { isIsoDate, periodRange } from '$lib/markSheets';

/** The period asked for with ?from=&to=, or this week */
export function rangeFrom(url: URL) {
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	if (isIsoDate(from) && isIsoDate(to)) {
		return from <= to ? { from, to } : { from: to, to: from };
	}
	return periodRange('thisWeek');
}
