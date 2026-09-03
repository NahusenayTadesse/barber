import { db } from '$lib/server/db';
import { courses, businessHours } from '$lib/server/db/schema';
import { loadFlash } from 'sveltekit-flash-message/server';

const abbr = (dayLabel: string) => dayLabel.slice(0, 3);

type HoursRow = { dayLabel: string; sortOrder: number; isClosed: boolean };

const groupConsecutiveDays = (days: HoursRow[]) => {
	const groups: HoursRow[][] = [];

	for (const day of days) {
		const lastGroup = groups[groups.length - 1];
		const previous = lastGroup?.[lastGroup.length - 1];

		if (previous && day.sortOrder === previous.sortOrder + 1) {
			lastGroup.push(day);
		} else {
			groups.push([day]);
		}
	}

	return groups;
};

const labelDayGroups = (days: HoursRow[]) =>
	groupConsecutiveDays(days)
		.map((group) =>
			group.length === 1
				? abbr(group[0].dayLabel)
				: `${abbr(group[0].dayLabel)}–${abbr(group[group.length - 1].dayLabel)}`
		)
		.join(', ');

export const load = loadFlash(async (event) => {
	const coursesList = await db.select().from(courses);

	const hoursRows = await db.select().from(businessHours).orderBy(businessHours.sortOrder);

	const openDays = hoursRows.filter((day) => !day.isClosed);
	const openRangeLabel = openDays.length > 0 ? labelDayGroups(openDays) : 'Closed';
	const closedDays = hoursRows.filter((day) => day.isClosed);
	const closedRangeLabel = closedDays.length > 0 ? labelDayGroups(closedDays) : null;

	const opensLabel = openDays[0]?.opensLabel ?? null;
	const closesLabel = openDays[0]?.closesLabel ?? null;

	return {
		courses: coursesList,
		businessHours: hoursRows,
		hoursSummary: {
			openRangeLabel,
			closedRangeLabel,
			opensLabel,
			closesLabel
		}
	};
});