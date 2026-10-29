import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';

let transporter: Transporter | undefined;

/** True once the SMTP_* variables are set, so the dashboard can say why email is unavailable. */
export const mailConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

function getTransporter() {
	if (!mailConfigured()) throw new Error('SMTP is not configured');
	transporter ??= nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT || 587),
		// Port 465 uses TLS from the start; others upgrade with STARTTLS
		secure: Number(env.SMTP_PORT) === 465,
		auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
	});
	return transporter;
}

export async function sendMail(options: {
	to: string | string[];
	replyTo?: string;
	subject: string;
	text: string;
	html: string;
	attachments?: { filename: string; content: Uint8Array; contentType?: string }[];
}) {
	const { attachments, ...message } = options;
	await getTransporter().sendMail({
		from: env.SMTP_FROM || env.SMTP_USER,
		...message,
		replyTo: message.replyTo || env.SMTP_REPLY_TO || undefined,
		attachments: attachments?.map((a) => ({ ...a, content: Buffer.from(a.content) }))
	});
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// --- Branded layout shared by every email ---

const GOLD = '#d4af37';
const SANS = 'Arial,Helvetica,sans-serif';
const SERIF = "Georgia,'Times New Roman',serif";
const PHONE = '020 3700 3997';
const MOBILE = '07846 119677';
const tel = (n: string) => n.replace(/\s/g, '');

// When new students start, shown in the welcome email. Update for each intake.
const COURSE_START = '1 November 2026';
const WHATSAPP = 'https://wa.me/447846119677';
const INSTAGRAM = 'https://www.instagram.com/dnd_barber_academy/';
const TIKTOK = 'https://www.tiktok.com/@dnd_barber_academy';

const siteUrl = () => (env.ORIGIN || 'https://dndbarberacademy.com').replace(/\/+$/, '');

/** A paragraph of body text. `html` must already be escaped. */
const para = (html: string) => `<p style="margin:0 0 16px">${html}</p>`;

/** The gold call-to-action button. */
const button = (href: string, label: string) =>
	`<a href="${escapeHtml(href)}" style="display:inline-block;background:${GOLD};color:#000;text-decoration:none;font-weight:bold;font-size:15px;padding:15px 30px;border-radius:4px">${escapeHtml(label)}</a>`;

/** The dark summary box, e.g. the course and amount. */
function detailsBox(title: string, rows: [string, string][]) {
	const row = ([k, v]: [string, string], i: number) => {
		const border = i ? 'border-top:1px solid #2a2a2a;' : '';
		return `<tr>
		<td style="padding:12px 0;${border}font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#9a9a9a">${escapeHtml(k)}</td>
		<td align="right" style="padding:12px 0 12px 12px;${border}font-size:15px;color:#ffffff;font-weight:bold">${escapeHtml(v)}</td>
	</tr>`;
	};
	return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;border-radius:8px;font-family:${SANS}">
	<tr><td style="padding:20px 24px 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${GOLD}">${escapeHtml(title)}</td></tr>
	<tr><td style="padding:0 24px 12px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.map(row).join('')}</table></td></tr>
</table>`;
}

/** Numbered steps, e.g. "What happens next". Titles and bodies are HTML. */
function steps(heading: string, items: [string, string][]) {
	const step = ([title, body]: [string, string], i: number) => `<tr>
		<td width="44" valign="top" style="padding:0 0 18px">
			<div style="width:32px;height:32px;line-height:32px;border-radius:16px;background:${GOLD};color:#000;font-weight:bold;font-size:15px;text-align:center">${i + 1}</div>
		</td>
		<td valign="top" style="padding:4px 0 18px;font-size:15px;line-height:1.55;color:#333">
			<strong style="color:#111">${title}</strong><br>${body}
		</td>
	</tr>`;
	return `<h2 style="margin:0 0 20px;font-family:${SERIF};font-size:22px;font-weight:normal;color:#111">${escapeHtml(heading)}</h2>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items.map(step).join('')}</table>`;
}

/**
 * Wraps content in the D&D email: black header with the crest, white body,
 * black footer. `sections` are HTML blocks shown one after another.
 */
function brandedEmail(o: {
	title: string;
	preheader: string;
	eyebrow: string;
	heading: string;
	sections: string[];
	signOff: string;
	footnote: string;
	/** Shows the "Questions? Call us" line; off for emails to staff */
	contact?: boolean;
}) {
	const site = siteUrl();
	const section = (html: string) =>
		`<tr><td style="padding:12px 36px 16px;font-family:${SANS};font-size:16px;line-height:1.65;color:#333">${html}</td></tr>`;

	return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${escapeHtml(o.title)}</title></head>
<body style="margin:0;padding:0;background:#f2efe8">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2efe8">
<tr><td align="center" style="padding:32px 12px">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;font-family:${SERIF}">
		<tr><td align="center" style="background:#050505;padding:40px 24px 32px;border-bottom:4px solid ${GOLD}">
			<img src="${site}/logo.png" width="112" height="112" alt="D&amp;D Barber Academy" style="display:block;border:0;margin:0 auto 20px">
			<div style="font-family:${SANS};font-size:12px;letter-spacing:4px;text-transform:uppercase;color:${GOLD}">${escapeHtml(o.eyebrow)}</div>
			<h1 style="margin:12px 0 0;font-size:32px;line-height:1.2;color:#ffffff;font-weight:normal">${escapeHtml(o.heading)}</h1>
		</td></tr>
		<tr><td style="height:24px;line-height:24px;font-size:0">&nbsp;</td></tr>
		${o.sections.map(section).join('\n\t\t')}
		${
			o.contact === false
				? '<tr><td style="height:20px;line-height:20px;font-size:0">&nbsp;</td></tr>'
				: `<tr><td align="center" style="padding:4px 36px 36px;font-family:${SANS}">
			<p style="margin:0;font-size:14px;color:#666">Questions? Call <a href="tel:${PHONE.replace(/\s/g, '')}" style="color:#111">${PHONE}</a> or <a href="${WHATSAPP}" style="color:#111">WhatsApp us</a></p>
		</td></tr>`
		}
		<tr><td align="center" style="background:#050505;padding:28px 24px;font-family:${SANS}">
			<div style="font-family:${SERIF};font-size:18px;color:${GOLD}">${escapeHtml(o.signOff)}</div>
			<p style="margin:14px 0 0;font-size:13px;line-height:1.7;color:#9a9a9a">
				D&amp;D Barber Academy · London<br>
				<a href="${site}" style="color:#9a9a9a">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a> ·
				<a href="${INSTAGRAM}" style="color:#9a9a9a">Instagram</a> ·
				<a href="${TIKTOK}" style="color:#9a9a9a">TikTok</a>
			</p>
			<p style="margin:12px 0 0;font-size:12px;color:#666">${escapeHtml(o.footnote)}</p>
		</td></tr>
	</table>
</td></tr>
</table>
</body>
</html>`;
}

const contactLine = `Questions? Call us on ${PHONE} or WhatsApp +44 7846 119677.`;

/** The email a student receives with their enrolment/payment link. */
export function paymentLinkEmail(o: {
	firstName: string;
	courseName: string;
	link: string;
	amountText: string;
}) {
	const name = o.firstName.trim() || 'there';
	const text = [
		`Hi ${name},`,
		'',
		`Here is your link to pay for the ${o.courseName} at D&D Barber Academy.${o.amountText ? ` ${o.amountText}` : ''}`,
		'',
		o.link,
		'',
		'Your place is reserved: just follow the link to pay securely by card.',
		'',
		contactLine,
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: 'Complete your enrolment',
		preheader: `Your place on the ${o.courseName} is reserved. Pay securely to confirm it.`,
		eyebrow: 'Complete your enrolment',
		heading: `Your place is waiting, ${name}`,
		sections: [
			para(
				`Here is your link to pay for the <strong style="color:#111">${escapeHtml(o.courseName)}</strong> at D&amp;D Barber Academy. Your place is reserved: just follow the link to pay securely by card.`
			) + (o.amountText ? para(escapeHtml(o.amountText)) : ''),
			detailsBox('Your enrolment', [['Course', o.courseName]]),
			`<div style="text-align:center;padding:8px 0">${button(o.link, 'Pay & Confirm My Place')}</div>`,
			`<p style="margin:0;font-size:13px;line-height:1.6;color:#666">If the button doesn't work, copy this link into your browser:<br><a href="${escapeHtml(o.link)}" style="color:#111;word-break:break-all">${escapeHtml(o.link)}</a></p>`
		],
		signOff: 'We look forward to training you.',
		footnote: "You're receiving this because you registered for a course with us."
	});

	return { subject: `Complete your enrolment: ${o.courseName}`, text, html };
}

/**
 * An email written by staff in the dashboard. The message is plain text: blank
 * lines start a new paragraph. Each student is greeted by their first name.
 */
export function customEmail(o: { firstName: string; subject: string; message: string }) {
	const name = o.firstName.trim() || 'there';
	const message = o.message.trim();
	const text = [
		`Hi ${name},`,
		'',
		message,
		'',
		contactLine,
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const paragraphs = message
		.split(/\n\s*\n/)
		.map((p) => para(escapeHtml(p.trim()).replace(/\n/g, '<br>')));

	const html = brandedEmail({
		title: o.subject,
		preheader: message.slice(0, 120),
		eyebrow: 'D&D Barber Academy',
		heading: `Hi ${name}`,
		sections: [paragraphs.join('')],
		signOff: 'D&D Barber Academy',
		footnote: "You're receiving this because you registered for a course with us."
	});

	return { subject: o.subject, text, html };
}

/** "2026-11-01" -> "1 Nov 2026" */
const shortDate = (iso: string) =>
	new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	});

/** The email a paid student receives with their link to choose a class. */
export function classPickerEmail(o: {
	firstName: string;
	courseName: string;
	link: string;
	/** The classes they can pick from, e.g. { name, schedule: "Mon 10:00–16:00", startDate } */
	classes: { name: string; schedule: string; startDate: string }[];
}) {
	const name = o.firstName.trim() || 'there';
	const options: [string, string][] = o.classes.map((c) => [
		c.name,
		`${c.schedule} · from ${shortDate(c.startDate)}`
	]);
	const intro = `Your place on the ${o.courseName} is confirmed. Now choose the class that fits your week: each one meets on different days and times.`;
	const note =
		'Places in each class are limited, so choose soon. You can use the same link to change your class until it starts.';

	const text = [
		`Hi ${name},`,
		'',
		intro,
		'',
		'Classes to choose from:',
		...options.map(([k, v]) => `- ${k}: ${v}`),
		'',
		`Choose your class: ${o.link}`,
		'',
		note,
		'',
		contactLine,
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: 'Choose your class',
		preheader: `Pick the days and times for your ${o.courseName}.`,
		eyebrow: 'One more step',
		heading: `Choose your class, ${name}`,
		sections: [
			para(escapeHtml(intro)),
			detailsBox('Classes to choose from', options),
			`<div style="text-align:center;padding:8px 0 4px">${button(o.link, 'Choose my class')}</div>`,
			`<p style="margin:0;font-size:14px;color:#666">${escapeHtml(note)}</p>`
		],
		signOff: 'See you in the chair.',
		footnote: "You're receiving this because you enrolled on a course with us."
	});

	return { subject: `Choose your class for the ${o.courseName}`, text, html };
}

/** The email a student in a class receives with when and where it meets. */
export function classScheduleEmail(o: {
	firstName: string;
	courseName: string;
	className: string;
	startDate: string;
	endDate: string | null;
	/** Weekly meetings in timetable order, e.g. ["Monday", "10:00–16:00"] */
	sessions: [string, string][];
	location: string | null;
	instructor: string | null;
	notes: string | null;
}) {
	const name = o.firstName.trim() || 'there';
	const intro = `Here is the schedule for your class on the ${o.courseName}. Please keep this email so you know when and where to be.`;
	const details: [string, string][] = [
		['Class', o.className],
		['Starts', shortDate(o.startDate)],
		['Ends', o.endDate ? shortDate(o.endDate) : 'Ongoing'],
		...(o.location ? [['Location', o.location] as [string, string]] : []),
		...(o.instructor ? [['Instructor', o.instructor] as [string, string]] : [])
	];
	const sessions: [string, string][] = o.sessions.length
		? o.sessions
		: [['To be confirmed', "We'll let you know the days and times soon."]];
	const notes = o.notes?.trim() ?? '';

	const text = [
		`Hi ${name},`,
		'',
		intro,
		'',
		...details.map(([k, v]) => `${k}: ${v}`),
		'',
		'Each week:',
		...sessions.map(([k, v]) => `- ${k}: ${v}`),
		...(notes ? ['', notes] : []),
		'',
		contactLine,
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: 'Your class schedule',
		preheader: `When and where your ${o.className} class meets.`,
		eyebrow: 'Class schedule',
		heading: `Your schedule, ${name}`,
		sections: [
			para(escapeHtml(intro)),
			detailsBox('Your class', details),
			detailsBox('Each week', sessions),
			...(notes
				? [
						notes
							.split(/\n\s*\n/)
							.map((p) => para(escapeHtml(p.trim()).replace(/\n/g, '<br>')))
							.join('')
					]
				: [])
		],
		signOff: 'See you in the chair.',
		footnote: "You're receiving this because you enrolled on a course with us."
	});

	return { subject: `Your class schedule for the ${o.courseName}`, text, html };
}

/** The email a student receives with their certificate attached. */
export function certificateEmail(o: {
	studentName: string;
	courseName: string;
	verifyUrl: string;
}) {
	const firstName = o.studentName.trim().split(/\s+/)[0] || 'there';
	const text = [
		`Congratulations ${firstName}!`,
		'',
		`You have successfully completed the ${o.courseName} at D&D Barber Academy. Your certificate is attached as a PDF, ready to print.`,
		'',
		'Anyone can check your certificate is genuine at:',
		o.verifyUrl,
		'',
		"We're proud of what you've achieved and wish you every success in your barbering career.",
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: 'Your certificate',
		preheader: `You've completed the ${o.courseName}. Your certificate is attached.`,
		eyebrow: 'Course completed',
		heading: `Congratulations, ${firstName}`,
		sections: [
			para(
				`You have successfully completed the <strong style="color:#111">${escapeHtml(o.courseName)}</strong> at D&amp;D Barber Academy. We're proud of what you've achieved.`
			),
			detailsBox('Your certificate', [
				['Awarded to', o.studentName.trim()],
				['Course', o.courseName],
				['Format', 'PDF, attached']
			]),
			para(
				'Your certificate is attached to this email, ready to print. Anyone, such as an employer, can check it is genuine using the link below.'
			) +
				`<div style="text-align:center;padding:8px 0 4px">${button(o.verifyUrl, 'Verify My Certificate')}</div>`,
			para(
				'We wish you every success in your barbering career. Stay in touch and show us your work!'
			)
		],
		signOff: 'Proud of you.',
		footnote: "You're receiving this because you completed a course with us."
	});

	return { subject: `Your certificate: ${o.courseName}`, text, html };
}

/** The email a student receives once their enrolment is confirmed. */
export function welcomeEmail(o: {
	firstName: string;
	courseName: string;
	duration?: string | null;
	paymentOption?: string | null;
	amountPaid?: number | null;
	/** How they paid, e.g. "Cash", "Bank Transfer" or "Card (Stripe)" */
	paidWith?: string | null;
	reference: number;
}) {
	const name = o.firstName.trim() || 'there';
	const ref = `DND-${String(o.reference).padStart(5, '0')}`;
	const paid = o.amountPaid && o.amountPaid > 0 ? `£${o.amountPaid.toFixed(2)}` : '';
	const received = o.paidWith
		? `We've received your ${paid ? `payment of ${paid}` : 'payment'} by ${o.paidWith.toLowerCase().replace('stripe', 'Stripe')}.`
		: '';

	const details: [string, string][] = [
		['Course', o.courseName],
		['Starts', COURSE_START]
	];
	if (o.duration) details.push(['Duration', o.duration]);
	if (o.paymentOption) details.push(['Payment option', o.paymentOption]);
	if (paid) details.push(['Amount paid', paid]);
	if (o.paidWith) details.push(['Paid with', o.paidWith]);
	details.push(['Reference', ref]);

	const startText = `Your course is scheduled to begin on ${COURSE_START}. We'll email you the full timetable, including session times, location and other important details, within the next seven days.`;
	const numbers = `${PHONE} (it's being set up) / ${MOBILE}`;

	const text = [
		`Hi ${name},`,
		'',
		['Thank you for registering with D&D Barber Academy!', received].filter(Boolean).join(' '),
		'',
		...details.map(([k, v]) => `${k}: ${v}`),
		'',
		'What happens next:',
		`1. ${startText}`,
		`2. Save our number: add ${numbers} to your contacts so you never miss an important update.`,
		'3. Follow us on Instagram (@dnd_barber_academy) to see what our students are creating.',
		'',
		contactLine,
		'',
		'See you in the chair,',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: 'Welcome to D&D Barber Academy',
		preheader: `Your course is scheduled to begin on ${COURSE_START}. Here's what happens next.`,
		eyebrow: 'Enrolment confirmed',
		heading: `Welcome to the Academy, ${name}`,
		sections: [
			para(
				['Thank you for registering with D&amp;D Barber Academy!', escapeHtml(received)]
					.filter(Boolean)
					.join(' ')
			),
			detailsBox('Your enrolment', details),
			steps('What happens next', [
				['Your course starts ' + escapeHtml(COURSE_START), escapeHtml(startText)],
				[
					'Save our number',
					`Add <a href="tel:${tel(PHONE)}" style="color:#111">${PHONE}</a> (it's being set up) / <a href="tel:${tel(MOBILE)}" style="color:#111">${MOBILE}</a> to your contacts so you never miss an important update.`
				],
				[
					'Get inspired',
					`Follow <a href="${INSTAGRAM}" style="color:#111">@dnd_barber_academy</a> to see what our students are creating.`
				]
			]),
			`<div style="text-align:center;padding:0 0 4px">${button(WHATSAPP, 'Message us on WhatsApp')}</div>`
		],
		signOff: 'See you in the chair.',
		footnote: `You're receiving this because you enrolled on a course with us. Reference ${ref}.`
	});

	return {
		subject: `Welcome to D&D Barber Academy: your ${o.courseName} place is confirmed`,
		text,
		html
	};
}

/** The email staff receive when a student's enrolment is confirmed. */
export function newEnrolmentAdminEmail(o: {
	studentName: string;
	email: string;
	phone?: string | null;
	courseName: string;
	paymentOption?: string | null;
	amountPaid?: number | null;
	discount?: string | null;
	/** How they paid, e.g. "Cash", "Bank Transfer" or "Card (Stripe)" */
	paidWith?: string | null;
	reference: number;
	source: string;
	/** What the student wrote when registering, or staff noted */
	notes?: string | null;
}) {
	const site = siteUrl();
	const notes = o.notes?.trim() ?? '';
	const ref = `DND-${String(o.reference).padStart(5, '0')}`;
	const dashboard = `${site}/dashboard/enrollments`;

	const details: [string, string][] = [
		['Student', o.studentName],
		['Email', o.email]
	];
	if (o.phone) details.push(['Phone', o.phone]);
	details.push(['Course', o.courseName]);
	if (o.paymentOption) details.push(['Payment option', o.paymentOption]);
	if (o.amountPaid && o.amountPaid > 0)
		details.push(['Amount paid', `£${o.amountPaid.toFixed(2)}`]);
	if (o.discount) details.push(['Discount', o.discount]);
	if (o.paidWith) details.push(['Paid with', o.paidWith]);
	details.push(['Source', o.source], ['Reference', ref]);

	const text = [
		`New enrolment: ${o.studentName} has enrolled on the ${o.courseName}.`,
		'',
		...details.map(([k, v]) => `${k}: ${v}`),
		...(notes ? ['', 'Notes:', notes] : []),
		'',
		`See all enrolments: ${dashboard}`,
		'',
		'Reply to this email to contact the student directly.'
	].join('\n');

	const html = brandedEmail({
		title: 'New enrolment',
		preheader: `${o.studentName} enrolled on the ${o.courseName}.`,
		eyebrow: 'New enrolment',
		heading: `${o.studentName} just enrolled`,
		sections: [
			para(
				`Good news: <strong style="color:#111">${escapeHtml(o.studentName)}</strong> has paid and is enrolled on the <strong style="color:#111">${escapeHtml(o.courseName)}</strong>. They've been sent their welcome email.`
			),
			detailsBox('Enrolment details', details),
			...(notes
				? [
						`<p style="margin:0 0 6px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#666">Notes</p>` +
							para(escapeHtml(notes).replace(/\n/g, '<br>'))
					]
				: []),
			para('Reply to this email to contact the student directly.') +
				`<div style="text-align:center;padding:4px 0">${button(dashboard, 'Open Enrollments')}</div>`
		],
		signOff: 'Another one in the chair.',
		footnote:
			"You're receiving this because your address is on the enrolment notification list. Manage it in the dashboard under Enrollments.",
		contact: false
	});

	return { subject: `New enrolment: ${o.studentName}, ${o.courseName}`, text, html };
}

/**
 * The email a student receives when staff mark their enrolment unpaid or
 * cancelled (being marked paid sends the welcome email instead).
 */
export function paymentStatusEmail(o: {
	firstName: string;
	courseName: string;
	status: 'unpaid' | 'cancelled';
	/** What they still owe, for an unpaid enrolment */
	amountDue?: number | null;
	/** Their payment link, for an unpaid enrolment */
	link?: string | null;
	reference: number;
}) {
	const name = o.firstName.trim() || 'there';
	const ref = `DND-${String(o.reference).padStart(5, '0')}`;
	const due = o.amountDue && o.amountDue > 0 ? `£${o.amountDue.toFixed(2)}` : '';
	const unpaid = o.status === 'unpaid';

	const summary = unpaid
		? `Your enrolment on the ${o.courseName} is now marked as unpaid${due ? `, with ${due} to pay` : ''}. Your place stays reserved until it's paid.`
		: `Your enrolment on the ${o.courseName} has been cancelled. If you think this is a mistake, please get in touch.`;
	const details: [string, string][] = [
		['Course', o.courseName],
		['Status', unpaid ? 'Unpaid' : 'Cancelled']
	];
	if (unpaid && due) details.push(['Amount due', due]);
	details.push(['Reference', ref]);
	const link = unpaid ? o.link : null;

	const text = [
		`Hi ${name},`,
		'',
		summary,
		'',
		...details.map(([k, v]) => `${k}: ${v}`),
		...(link ? ['', `Pay securely by card: ${link}`] : []),
		'',
		contactLine,
		'',
		'D&D Barber Academy',
		siteUrl()
	].join('\n');

	const html = brandedEmail({
		title: unpaid ? 'Your enrolment is unpaid' : 'Your enrolment was cancelled',
		preheader: summary,
		eyebrow: unpaid ? 'Payment update' : 'Enrolment cancelled',
		heading: unpaid ? `A payment update, ${name}` : `Your enrolment was cancelled, ${name}`,
		sections: [
			para(escapeHtml(summary)),
			detailsBox('Your enrolment', details),
			...(link
				? [
						`<div style="text-align:center;padding:8px 0">${button(link, 'Pay & Confirm My Place')}</div>`
					]
				: [])
		],
		signOff: 'D&D Barber Academy',
		footnote: `You're receiving this because you registered for a course with us. Reference ${ref}.`
	});

	return {
		subject: unpaid
			? `Payment update: your ${o.courseName} enrolment is unpaid`
			: `Your ${o.courseName} enrolment was cancelled`,
		text,
		html
	};
}

/** The email staff receive when a student's payment status is changed in the dashboard. */
export function paymentStatusAdminEmail(o: {
	studentName: string;
	email: string;
	courseName: string;
	/** e.g. "Paid" -> "Unpaid" */
	from: string;
	to: string;
	/** Who changed it */
	by: string;
	reference: number;
}) {
	const site = siteUrl();
	const ref = `DND-${String(o.reference).padStart(5, '0')}`;
	const dashboard = `${site}/dashboard/enrollments`;
	const summary = `${o.by} changed ${o.studentName}'s payment for the ${o.courseName} from ${o.from} to ${o.to}.`;
	const details: [string, string][] = [
		['Student', o.studentName],
		['Email', o.email],
		['Course', o.courseName],
		['Status', `${o.from} → ${o.to}`],
		['Changed by', o.by],
		['Reference', ref]
	];

	const text = [
		summary,
		'',
		...details.map(([k, v]) => `${k}: ${v}`),
		'',
		`See all enrolments: ${dashboard}`
	].join('\n');

	const html = brandedEmail({
		title: 'Payment status changed',
		preheader: summary,
		eyebrow: 'Payment status changed',
		heading: `${o.studentName} is now ${o.to.toLowerCase()}`,
		sections: [
			para(escapeHtml(summary) + " They've been emailed about it."),
			detailsBox('Enrolment details', details),
			`<div style="text-align:center;padding:4px 0">${button(dashboard, 'Open Enrollments')}</div>`
		],
		signOff: 'D&D Barber Academy',
		footnote:
			"You're receiving this because your address is on the enrolment notification list. Manage it in the dashboard under Enrollments.",
		contact: false
	});

	return { subject: `Payment status: ${o.studentName} is now ${o.to.toLowerCase()}`, text, html };
}
