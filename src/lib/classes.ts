// Shared (client + server) helpers for the class schedule.

/** Days in timetable order, Monday first. value follows JS Date#getDay(): 0 = Sunday. */
export const weekDays = [
	{ value: 1, short: 'Mon', name: 'Monday' },
	{ value: 2, short: 'Tue', name: 'Tuesday' },
	{ value: 3, short: 'Wed', name: 'Wednesday' },
	{ value: 4, short: 'Thu', name: 'Thursday' },
	{ value: 5, short: 'Fri', name: 'Friday' },
	{ value: 6, short: 'Sat', name: 'Saturday' },
	{ value: 0, short: 'Sun', name: 'Sunday' }
];

export type ClassSession = { dayOfWeek: number; startTime: string; endTime: string };

/** "10:00:00" -> "10:00" */
export const shortTime = (t: string) => t.slice(0, 5);

/** Sessions sorted Monday first, then by start time. */
export const sortSessions = <T extends ClassSession>(sessions: T[]) =>
	[...sessions].sort(
		(a, b) =>
			weekDays.findIndex((d) => d.value === a.dayOfWeek) -
				weekDays.findIndex((d) => d.value === b.dayOfWeek) || a.startTime.localeCompare(b.startTime)
	);

/** "Mon 10:00–16:00, Sat 09:00–13:00" */
export const formatSessions = (sessions: ClassSession[]) =>
	sortSessions(sessions)
		.map(
			(s) =>
				`${weekDays.find((d) => d.value === s.dayOfWeek)?.short} ${shortTime(s.startTime)}–${shortTime(s.endTime)}`
		)
		.join(', ') || 'No sessions';

export type ClassStatus = 'upcoming' | 'running' | 'finished' | 'disabled';

/** Where a class is on the calendar, given today's YYYY-MM-DD date. */
export function classStatus(
	c: { isActive: boolean; startDate: string; endDate: string | null },
	today: string
): ClassStatus {
	if (!c.isActive) return 'disabled';
	if (today < c.startDate) return 'upcoming';
	if (c.endDate && today > c.endDate) return 'finished';
	return 'running';
}
