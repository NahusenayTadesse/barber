// Shared (client + server): the student practice & mark sheets, and the
// periods a student report can cover.
import type { Audience } from './courses';

export type MarkSheetWeek = { week: number; title: string; skills: string[] };

/** Highest mark a skill can get on a report */
export const MAX_MARK = 10;

/**
 * The practice & mark sheet for each kind of course, week by week, as printed
 * on the D&D Student Practice & Mark Sheets.
 */
export const markSheets: Record<Audience, MarkSheetWeek[]> = {
	men: [
		{
			week: 1,
			title: 'Professionalism, Hygiene & Consultation',
			skills: [
				'Professional conduct and client care',
				'Health, safety and workstation preparation',
				'Client consultation and agreeing the service'
			]
		},
		{
			week: 2,
			title: 'Tools, Equipment & Maintenance',
			skills: [
				'Identify barbering tools and their uses',
				'Clipper, trimmer and scissor handling',
				'Cleaning, disinfecting and safe storage'
			]
		},
		{
			week: 3,
			title: 'Classic Haircuts, Sectioning & Guidelines',
			skills: [
				'Hair sectioning and guideline creation',
				'One-length and classic short-back-and-sides',
				'Comb and clipper coordination'
			]
		},
		{
			week: 4,
			title: 'Fades, Tapers & Blending',
			skills: [
				'Low, mid and high fade placement',
				'Guard selection and clipper lever control',
				'Blending weight lines and checking the finish'
			]
		},
		{
			week: 5,
			title: 'Beard Trimming & Sculpting',
			skills: [
				'Beard consultation and preparation',
				'Beard length, shape and symmetry',
				'Cheek lines, neckline and moustache detailing'
			]
		},
		{
			week: 6,
			title: 'Skin Fades, Outlines & Finishing',
			skills: [
				'Skin-fade stages and blending',
				'Temple, neckline and edge-up detailing',
				'Final quality check and professional finish'
			]
		},
		{
			week: 7,
			title: 'Afro, Curly & Textured Hair',
			skills: [
				'Hair texture, curl pattern and shrinkage',
				'Preparation and careful detangling',
				'Cutting textured hair and checking shape'
			]
		},
		{
			week: 8,
			title: 'Hair Designs & Creative Styles',
			skills: [
				'Consultation and planning simple designs',
				'Trimmer control and clean line work',
				'Symmetry, proportion and finishing'
			]
		},
		{
			week: 9,
			title: 'Hair Colouring & Chemical Safety',
			skills: [
				'Identify colouring products and instructions',
				'Consultation and required safety checks',
				'Protective equipment and safe working procedures'
			]
		},
		{
			week: 10,
			title: 'Hot-Towel Shaving & Skin Care',
			skills: [
				'Shaving consultation and preparation',
				'Towel temperature and equipment hygiene',
				'Safe razor handling and aftercare'
			]
		},
		{
			week: 11,
			title: 'Client Service, Business & Marketing',
			skills: [
				'Professional welcome and client communication',
				'Appointment keeping and time management',
				'Customer care, presenting work and permission for photos'
			]
		},
		{
			week: 12,
			title: 'Revision, Assessment & Career Readiness',
			skills: [
				'Revision of hygiene, consultation and tool selection',
				'Practical haircut, fade and beard skills assessment',
				'Teacher feedback and next learning goals'
			]
		}
	],
	women: [
		{
			week: 1,
			title: 'H&S and Setting',
			skills: ['Introduction', 'Health and safety', 'Dry hair set practice']
		},
		{
			week: 2,
			title: 'Hair Wash & Blow Dry',
			skills: ['Hair wash', 'Wet set', 'Blow dry']
		},
		{
			week: 3,
			title: 'Thermal Styling',
			skills: [
				'Hair straightening with straightener',
				'Curling with straightener',
				'Waving with straightener'
			]
		},
		{
			week: 4,
			title: 'Braiding',
			skills: [
				'Natural hair corn rows',
				'Corn rows with extensions',
				'Box braids, natural hair',
				'Box braids with extensions',
				'Goddess braids',
				'Stitch braids',
				'Twists'
			]
		},
		{
			week: 5,
			title: 'Sew-In / Human Hair Installation',
			skills: ['Sew-in installation']
		},
		{
			week: 6,
			title: 'Hair Up and Styling with Tong',
			skills: [
				'Curling using tong',
				'Waving using tong',
				'Classic hair up',
				'Half hair up',
				'Hair up using ornaments'
			]
		},
		{
			week: 7,
			title: 'Hair Cut',
			skills: ['One length 0°', 'Graduation 45°']
		},
		{
			week: 8,
			title: 'Assessments & Exam Week',
			skills: ['Assessment and exam']
		}
	]
};

/** The mark sheet for a course; men's when the course is unknown (e.g. deleted). */
export const markSheetFor = (audience: Audience | null | undefined) =>
	markSheets[audience ?? 'men'];

// --- Dates (all YYYY-MM-DD calendar dates) ---

const toDate = (iso: string) => new Date(`${iso}T12:00:00Z`);
const toIso = (d: Date) => d.toISOString().slice(0, 10);

/** The date `days` after (or before) a date */
export const addDays = (iso: string, days: number) => {
	const d = toDate(iso);
	d.setUTCDate(d.getUTCDate() + days);
	return toIso(d);
};

/** Today as a UK calendar date */
export const ukToday = () =>
	new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London' }).format(new Date());

/** The Monday to Sunday week a date falls in */
export function weekOf(iso: string) {
	const monday = addDays(iso, -((toDate(iso).getUTCDay() + 6) % 7));
	return { from: monday, to: addDays(monday, 6) };
}

export const isIsoDate = (s: unknown): s is string =>
	typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(toDate(s).getTime());

/** "2 Nov 2026" */
export const shortDate = (iso: string) =>
	toDate(iso).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});

/** "2 Nov 2026 – 8 Nov 2026", or one date when the range is a single day */
export const formatRange = (from: string, to: string) =>
	from === to ? shortDate(from) : `${shortDate(from)} – ${shortDate(to)}`;

/**
 * Which week of the mark sheet a student is on, counted from their class's start
 * date; week 1 before the class starts or without a class, never past the last week.
 */
export function currentSheetWeek(classStart: string | null, today: string, weeks: number) {
	if (!classStart) return 1;
	const days = Math.floor((toDate(today).getTime() - toDate(classStart).getTime()) / 86_400_000);
	return Math.min(Math.max(Math.floor(days / 7) + 1, 1), weeks);
}

export type ReportPeriod = 'thisWeek' | 'lastWeek' | 'custom';

export const periodItems: { value: ReportPeriod; name: string }[] = [
	{ value: 'thisWeek', name: 'This week' },
	{ value: 'lastWeek', name: 'Last week' },
	{ value: 'custom', name: 'Date range' }
];

/** The dates a preset period covers */
export function periodRange(period: Exclude<ReportPeriod, 'custom'>, today = ukToday()) {
	const week = weekOf(today);
	return period === 'thisWeek' ? week : weekOf(addDays(week.from, -7));
}
