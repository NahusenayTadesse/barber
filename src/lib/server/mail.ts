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
	to: string;
	subject: string;
	text: string;
	html: string;
	attachments?: { filename: string; content: Uint8Array; contentType?: string }[];
}) {
	const { attachments, ...message } = options;
	await getTransporter().sendMail({
		from: env.SMTP_FROM || env.SMTP_USER,
		replyTo: env.SMTP_REPLY_TO || undefined,
		...message,
		attachments: attachments?.map((a) => ({ ...a, content: Buffer.from(a.content) }))
	});
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The email a student receives with their enrolment/payment link. */
export function paymentLinkEmail(o: {
	firstName: string;
	courseName: string;
	link: string;
	amountText: string;
}) {
	const name = o.firstName || 'there';
	const text = [
		`Hi ${name},`,
		'',
		`Here is your link to pay for the ${o.courseName} at D&D Barber Academy.${o.amountText ? ` ${o.amountText}` : ''}`,
		'',
		o.link,
		'',
		'Your place is reserved: just follow the link to pay securely by card.',
		'',
		'Questions? Call us on 020 3700 3997 or WhatsApp +44 7846 119677.',
		'',
		'D&D Barber Academy'
	].join('\n');

	const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">
	<p>Hi ${escapeHtml(name)},</p>
	<p>Here is your link to pay for the <strong>${escapeHtml(o.courseName)}</strong> at D&amp;D Barber Academy.${o.amountText ? ` ${escapeHtml(o.amountText)}` : ''}</p>
	<p style="margin:28px 0"><a href="${escapeHtml(o.link)}" style="background:#c9a227;color:#000;padding:14px 26px;text-decoration:none;font-weight:bold;border-radius:4px;display:inline-block">Pay &amp; Confirm My Place</a></p>
	<p>Your place is reserved: just follow the link to pay securely by card.</p>
	<p style="font-size:13px;color:#666">If the button doesn't work, copy this link into your browser:<br><a href="${escapeHtml(o.link)}">${escapeHtml(o.link)}</a></p>
	<p>Questions? Call us on <a href="tel:02037003997">020 3700 3997</a> or <a href="https://wa.me/447846119677">WhatsApp us</a>.</p>
	<p>D&amp;D Barber Academy</p>
</div>`;

	return { subject: `Complete your enrolment: ${o.courseName}`, text, html };
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
		'D&D Barber Academy'
	].join('\n');

	const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#222;max-width:560px">
	<p>Congratulations ${escapeHtml(firstName)}!</p>
	<p>You have successfully completed the <strong>${escapeHtml(o.courseName)}</strong> at D&amp;D Barber Academy. Your certificate is attached as a PDF, ready to print.</p>
	<p>Anyone, such as an employer, can check your certificate is genuine here:<br><a href="${escapeHtml(o.verifyUrl)}">${escapeHtml(o.verifyUrl)}</a></p>
	<p>We're proud of what you've achieved and wish you every success in your barbering career.</p>
	<p>D&amp;D Barber Academy</p>
</div>`;

	return { subject: `Your certificate: ${o.courseName}`, text, html };
}
