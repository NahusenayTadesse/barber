import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { and, asc, eq, gte, inArray, lte, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import {
	classSessions,
	classes,
	courses,
	enrolments,
	studentReportMarks,
	studentReports
} from '$lib/server/db/schema';
import { formatSessions } from '$lib/classes';
import { MAX_MARK, formatRange, markSheetFor, shortDate } from '$lib/markSheets';
import { mailConfigured, sendMail, studentReportEmail } from '$lib/server/mail';

export type ReportEntry = {
	id: number;
	date: string;
	week: number;
	weekTitle: string;
	teacherName: string | null;
	comment: string | null;
	marks: { skill: string; mark: number }[];
};

export type ReportWeek = {
	week: number;
	title: string;
	skills: { skill: string; marks: { date: string; mark: number }[]; average: number | null }[];
};

export type StudentReport = Awaited<ReturnType<typeof getStudentReport>>;

const average = (marks: number[]) =>
	marks.length ? Math.round((marks.reduce((a, b) => a + b, 0) / marks.length) * 10) / 10 : null;

/**
 * Everything on a student's report between two dates (inclusive): their
 * details for the top of the mark sheet, each session's report, and the marks
 * for every skill practised, grouped by the week of the sheet.
 * Undefined if there's no such student.
 */
export async function getStudentReport(enrolmentId: number, from: string, to: string) {
	const student = await db
		.select({
			id: enrolments.id,
			name: sql<string>`TRIM(CONCAT_WS(' ', ${enrolments.firstName}, ${enrolments.lastName}))`,
			firstName: enrolments.firstName,
			email: enrolments.email,
			course: sql<string>`COALESCE(${courses.name}, ${enrolments.course})`,
			audience: courses.audience,
			classId: classes.id,
			className: classes.name,
			instructor: classes.instructor,
			classStart: classes.startDate
		})
		.from(enrolments)
		.leftJoin(courses, eq(enrolments.courseId, courses.id))
		.leftJoin(classes, eq(enrolments.classId, classes.id))
		.where(eq(enrolments.id, enrolmentId))
		.then((rows) => rows[0]);
	if (!student) return undefined;

	const sessions = student.classId
		? await db.select().from(classSessions).where(eq(classSessions.classId, student.classId))
		: [];

	const reports = await db
		.select()
		.from(studentReports)
		.where(
			and(
				eq(studentReports.enrolmentId, enrolmentId),
				gte(studentReports.reportDate, from),
				lte(studentReports.reportDate, to)
			)
		)
		.orderBy(asc(studentReports.reportDate), asc(studentReports.id));
	const marks = reports.length
		? await db
				.select()
				.from(studentReportMarks)
				.where(
					inArray(
						studentReportMarks.reportId,
						reports.map((r) => r.id)
					)
				)
				.orderBy(asc(studentReportMarks.id))
		: [];

	const entries: ReportEntry[] = reports.map((r) => ({
		id: r.id,
		date: r.reportDate,
		week: r.week,
		weekTitle: r.weekTitle,
		teacherName: r.teacherName,
		comment: r.comment,
		marks: marks.filter((m) => m.reportId === r.id).map(({ skill, mark }) => ({ skill, mark }))
	}));

	// Weeks worked on in this period, in sheet order, each skill with its marks.
	// Skills come in the sheet's order; any no longer on the sheet go last.
	const sheet = markSheetFor(student.audience);
	const weeks: ReportWeek[] = [...new Set(entries.map((e) => e.week))]
		.sort((a, b) => a - b)
		.map((week) => {
			const inWeek = entries.filter((e) => e.week === week);
			const onSheet = sheet.find((w) => w.week === week);
			const marked = inWeek.flatMap((e) => e.marks.map((m) => m.skill));
			const skills = [...new Set([...(onSheet?.skills ?? []), ...marked])];
			return {
				week,
				title: onSheet?.title ?? inWeek[0].weekTitle,
				skills: skills.map((skill) => {
					const got = inWeek.flatMap((e) =>
						e.marks.filter((m) => m.skill === skill).map((m) => ({ date: e.date, mark: m.mark }))
					);
					return { skill, marks: got, average: average(got.map((m) => m.mark)) };
				})
			};
		});

	const allMarks = entries.flatMap((e) => e.marks.map((m) => m.mark));
	const teachers = [
		...new Set(entries.map((e) => e.teacherName).filter((t): t is string => Boolean(t)))
	];

	return {
		student: {
			...student,
			days: sessions.length ? formatSessions(sessions) : null,
			// The class's teacher, or whoever wrote the reports
			teacher: student.instructor || teachers.join(', ') || null
		},
		from,
		to,
		entries,
		weeks,
		average: average(allMarks),
		markCount: allMarks.length
	};
}

/** "Report-Jane-Doe-2026-11-02-to-2026-11-08.pdf" */
export const reportFileName = (r: StudentReport & object) =>
	`Report-${r.student.name.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '')}-${r.from}${r.from === r.to ? '' : `-to-${r.to}`}.pdf`;

type RGB = [number, number, number];
const INK: RGB = [20, 20, 20];
const MUTED: RGB = [110, 110, 110];
const GOLD: RGB = [184, 146, 42];
const LINE: RGB = [60, 60, 60];

/** The report as an A4 PDF laid out like the printed practice & mark sheet. */
export function reportPdf(r: StudentReport & object) {
	const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
	const W = doc.internal.pageSize.getWidth();
	const H = doc.internal.pageSize.getHeight();
	const M = 40;
	doc.setProperties({
		title: `Student Report — ${r.student.name}`,
		subject: `${r.student.course}, ${formatRange(r.from, r.to)}`,
		author: 'D&D Barber Academy'
	});

	const header = () => {
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(11);
		doc.setTextColor(...INK);
		doc.text('D&D ACADEMY', W / 2, 40, { align: 'center' });
		doc.setFontSize(17);
		doc.text('STUDENT PRACTICE & MARK SHEET', W / 2, 62, { align: 'center' });
	};
	header();

	const label = { fontStyle: 'bold' as const, fontSize: 7, textColor: INK };
	const value = { fontSize: 10, textColor: INK, minCellHeight: 22 };
	autoTable(doc, {
		startY: 78,
		margin: { left: M, right: M },
		theme: 'grid',
		styles: { lineColor: LINE, lineWidth: 0.6, font: 'helvetica', cellPadding: 5 },
		body: [
			[
				{ content: 'STUDENT NAME', styles: label },
				{ content: 'DAYS OF CLASS', styles: label }
			],
			[
				{ content: r.student.name, styles: value },
				{ content: r.student.days ?? '—', styles: value }
			],
			[
				{ content: 'TEACHER NAME', styles: label },
				{ content: 'COURSE START DATE', styles: label }
			],
			[
				{ content: r.student.teacher ?? '—', styles: value },
				{ content: r.student.classStart ? shortDate(r.student.classStart) : '—', styles: value }
			],
			[
				{ content: 'COURSE', styles: label },
				{ content: 'REPORT PERIOD', styles: label }
			],
			[
				{
					content: [r.student.course, r.student.className].filter(Boolean).join(' · '),
					styles: value
				},
				{ content: formatRange(r.from, r.to), styles: value }
			]
		]
	});

	let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;
	const lastY = () =>
		(doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

	/** The black band above each section, as on the sheet */
	const band = (text: string, right?: string) => {
		if (y + 60 > H - 50) {
			doc.addPage();
			header();
			y = 78;
		}
		y += 14;
		doc.setFillColor(...INK);
		doc.rect(M, y, W - M * 2, 20, 'F');
		doc.setFont('helvetica', 'bold');
		doc.setFontSize(8.5);
		doc.setTextColor(255, 255, 255);
		doc.text(text.toUpperCase(), M + 8, y + 13.5);
		if (right) doc.text(right, W - M - 8, y + 13.5, { align: 'right' });
		y += 26;
	};

	const sessions = r.entries.length;
	band(
		'Summary',
		`${sessions} session${sessions === 1 ? '' : 's'}${r.average === null ? '' : ` · average ${r.average}/${MAX_MARK}`}`
	);

	if (!sessions) {
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(10);
		doc.setTextColor(...MUTED);
		doc.text('No practice was reported in this period.', M + 8, y + 10);
		y += 20;
	}

	for (const week of r.weeks) {
		band(`Week ${week.week}  ${week.title}`);
		autoTable(doc, {
			startY: y,
			margin: { left: M + 10, right: M + 10, top: 78 },
			theme: 'grid',
			styles: {
				font: 'helvetica',
				fontSize: 9,
				textColor: INK,
				lineColor: LINE,
				lineWidth: 0.5,
				cellPadding: 5
			},
			headStyles: { fillColor: [240, 240, 240], textColor: INK, fontStyle: 'bold', fontSize: 8 },
			columnStyles: {
				1: { cellWidth: 150 },
				2: { cellWidth: 60, halign: 'center', fontStyle: 'bold' }
			},
			head: [['Skill', 'Marks', `Mark /${MAX_MARK}`]],
			body: week.skills.map((s) => [
				s.skill,
				s.marks.map((m) => `${shortDate(m.date)}: ${m.mark}`).join('\n') || 'Not practised',
				s.average === null ? '—' : String(s.average)
			]),
			didDrawPage: (data) => {
				if (data.pageNumber > 1) header();
			}
		});
		y = lastY();
	}

	if (r.entries.some((e) => e.comment)) {
		band("Teacher's comments");
		autoTable(doc, {
			startY: y,
			margin: { left: M + 10, right: M + 10, top: 78 },
			theme: 'grid',
			styles: {
				font: 'helvetica',
				fontSize: 9,
				textColor: INK,
				lineColor: LINE,
				lineWidth: 0.5,
				cellPadding: 5
			},
			headStyles: { fillColor: [240, 240, 240], textColor: INK, fontStyle: 'bold', fontSize: 8 },
			columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 45 }, 2: { cellWidth: 90 } },
			head: [['Date', 'Week', 'Teacher', 'Comment']],
			body: r.entries
				.filter((e) => e.comment)
				.map((e) => [shortDate(e.date), String(e.week), e.teacherName ?? '—', e.comment!]),
			didDrawPage: (data) => {
				if (data.pageNumber > 1) header();
			}
		});
		y = lastY();
	}

	// Signature boxes, as at the end of the sheet
	if (y + 150 > H - 50) {
		doc.addPage();
		header();
		y = 78;
	}
	band('Signature');
	autoTable(doc, {
		startY: y,
		margin: { left: M, right: M },
		theme: 'grid',
		styles: { lineColor: LINE, lineWidth: 0.6, font: 'helvetica', cellPadding: 5 },
		body: [
			[
				{ content: 'TEACHER NAME', styles: label },
				{ content: 'STUDENT NAME', styles: label }
			],
			[
				{ content: r.student.teacher ?? '', styles: value },
				{ content: r.student.name, styles: value }
			],
			[
				{ content: 'SIGNATURE', styles: label },
				{ content: 'SIGNATURE', styles: label }
			],
			[
				{ content: '', styles: value },
				{ content: '', styles: value }
			],
			[
				{ content: 'DATE', styles: label },
				{ content: 'DATE', styles: label }
			],
			[
				{ content: '', styles: value },
				{ content: '', styles: value }
			]
		]
	});

	// Footer on every page
	const pages = doc.getNumberOfPages();
	for (let i = 1; i <= pages; i++) {
		doc.setPage(i);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(7.5);
		doc.setTextColor(...MUTED);
		doc.text('D&D ACADEMY  |  www.dndbarberacademy.com', W / 2, H - 24, { align: 'center' });
		doc.setTextColor(...GOLD);
		doc.text(`${i} / ${pages}`, W - M, H - 24, { align: 'right' });
	}

	return new Uint8Array(doc.output('arraybuffer'));
}

type Outcome = { ok: true; message: string } | { ok: false; status: number; message: string };

/** Email a student their report for the period, with the PDF attached */
export async function emailStudentReport(
	enrolmentId: number,
	from: string,
	to: string
): Promise<Outcome> {
	if (!mailConfigured()) return { ok: false, status: 500, message: 'Email is not set up yet.' };
	const report = await getStudentReport(enrolmentId, from, to);
	if (!report) return { ok: false, status: 404, message: 'Unknown student.' };
	if (!report.entries.length) {
		return { ok: false, status: 400, message: 'No report was written for these dates.' };
	}

	try {
		await sendMail({
			to: report.student.email,
			...studentReportEmail({
				firstName: report.student.firstName,
				courseName: report.student.course,
				period: formatRange(from, to),
				sessions: report.entries.length,
				average: report.average === null ? null : `${report.average}/${MAX_MARK}`,
				weeks: report.weeks.map((w) => `Week ${w.week}: ${w.title}`)
			}),
			attachments: [
				{
					filename: reportFileName(report),
					content: reportPdf(report),
					contentType: 'application/pdf'
				}
			]
		});
	} catch (err) {
		console.error('Error emailing report:', err instanceof Error ? err.message : err);
		return { ok: false, status: 500, message: "The report couldn't be emailed." };
	}
	return { ok: true, message: `Report emailed to ${report.student.email}` };
}
