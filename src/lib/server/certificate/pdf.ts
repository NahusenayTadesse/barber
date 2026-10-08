import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import playfairRegular from './fonts/Playfair-Regular.ttf?inline';
import playfairBold from './fonts/Playfair-Bold.ttf?inline';
import playfairItalic from './fonts/Playfair-RegularItalic.ttf?inline';
import playfairBoldItalic from './fonts/Playfair-BoldItalic.ttf?inline';
import bebasNeue from './fonts/BebasNeue-Regular.ttf?inline';
import seal from './seal.png?inline';

export type CertificateData = {
	code: string;
	title: string;
	studentName: string;
	courseName: string;
	courseDetails: string | null;
	/** YYYY-MM-DD */
	completedOn: string;
	signatoryName: string | null;
	signatoryRole: string | null;
};

type RGB = [number, number, number];
const PAPER: RGB = [251, 248, 240];
const INK: RGB = [22, 20, 18];
const MUTED: RGB = [112, 104, 92];
const GOLD: RGB = [184, 146, 42];

const base64 = (dataUrl: string) => dataUrl.slice(dataUrl.indexOf(',') + 1);

/** "8 October 2026" from "2026-10-08" */
export const formatCertificateDate = (isoDate: string) =>
	new Intl.DateTimeFormat('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(`${isoDate}T00:00:00Z`));

/** Builds the certificate as an A4 landscape PDF. */
export async function certificatePdf(cert: CertificateData, verifyUrl: string) {
	const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4', compress: true });
	const W = doc.internal.pageSize.getWidth();
	const H = doc.internal.pageSize.getHeight();
	const cx = W / 2;

	const fonts: [string, string, string, string][] = [
		['Playfair-Regular.ttf', playfairRegular, 'Playfair', 'normal'],
		['Playfair-Bold.ttf', playfairBold, 'Playfair', 'bold'],
		['Playfair-Italic.ttf', playfairItalic, 'Playfair', 'italic'],
		['Playfair-BoldItalic.ttf', playfairBoldItalic, 'Playfair', 'bolditalic'],
		['BebasNeue.ttf', bebasNeue, 'Bebas', 'normal']
	];
	for (const [file, data, family, style] of fonts) {
		doc.addFileToVFS(file, base64(data));
		doc.addFont(file, family, style);
	}

	doc.setProperties({
		title: `${cert.title} — ${cert.studentName}`,
		subject: cert.courseName,
		author: 'D&D Barber Academy',
		creator: 'D&D Barber Academy'
	});

	const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
	const stroke = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
	const color = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);

	/** Centred text, allowing letter spacing (jsPDF's own centring ignores it). */
	function centred(text: string, y: number, charSpace = 0) {
		const width = doc.getTextWidth(text) + charSpace * Math.max(text.length - 1, 0);
		doc.text(text, cx - width / 2, y, { charSpace });
	}

	/** Largest font size (up to `max`) at which the text fits `maxWidth`. */
	function fitSize(text: string, max: number, maxWidth: number, min = 14) {
		let size = max;
		doc.setFontSize(size);
		while (size > min && doc.getTextWidth(text) > maxWidth) {
			size -= 1;
			doc.setFontSize(size);
		}
		return size;
	}

	function diamond(x: number, y: number, r: number) {
		doc.triangle(x - r, y, x, y - r, x + r, y, 'F');
		doc.triangle(x - r, y, x, y + r, x + r, y, 'F');
	}

	/** A thin gold rule with a diamond in the middle. */
	function flourish(y: number, halfWidth: number) {
		stroke(GOLD);
		doc.setLineWidth(0.6);
		doc.line(cx - halfWidth, y, cx - 10, y);
		doc.line(cx + 10, y, cx + halfWidth, y);
		fill(GOLD);
		diamond(cx, y, 3.2);
		diamond(cx - halfWidth - 5, y, 1.6);
		diamond(cx + halfWidth + 5, y, 1.6);
	}

	// --- Paper and frame ---
	fill(PAPER);
	doc.rect(0, 0, W, H, 'F');

	stroke(INK);
	doc.setLineWidth(7);
	doc.rect(16, 16, W - 32, H - 32);

	stroke(GOLD);
	doc.setLineWidth(1.6);
	doc.rect(27, 27, W - 54, H - 54);
	doc.setLineWidth(0.5);
	doc.rect(32, 32, W - 64, H - 64);

	// Corner ornaments: a gold square knot at each corner of the inner frame
	fill(GOLD);
	for (const [x, y] of [
		[27, 27],
		[W - 27, 27],
		[27, H - 27],
		[W - 27, H - 27]
	]) {
		diamond(x, y, 7);
		fill(PAPER);
		diamond(x, y, 3);
		fill(GOLD);
		diamond(x, y, 1.4);
	}

	// --- Heading ---
	doc.addImage(seal, 'PNG', cx - 39, 46, 78, 78);

	doc.setFont('Bebas', 'normal');
	doc.setFontSize(12);
	color(GOLD);
	centred('D&D BARBER ACADEMY  ·  LONDON', 144, 3);

	// "Certificate of Completion" → a large "CERTIFICATE" over an italic "of Completion"
	const split = /^(\S+)\s+(of\s.+)$/i.exec(cert.title.trim());
	color(INK);
	doc.setFont('Bebas', 'normal');
	if (split) {
		doc.setFontSize(52);
		centred(split[1].toUpperCase(), 196, 7);
		doc.setFont('Playfair', 'italic');
		doc.setFontSize(22);
		color(GOLD);
		centred(split[2], 224);
	} else {
		fitSize(cert.title.toUpperCase(), 46, 600, 28);
		centred(cert.title.toUpperCase(), 210, 5);
	}

	flourish(246, 120);

	// --- Body ---
	doc.setFont('Playfair', 'italic');
	doc.setFontSize(13);
	color(MUTED);
	centred('This is to certify that', 278);

	doc.setFont('Playfair', 'bolditalic');
	fitSize(cert.studentName, 40, 600, 20);
	color(INK);
	centred(cert.studentName, 324);

	stroke(GOLD);
	doc.setLineWidth(0.8);
	doc.line(cx - 200, 338, cx + 200, 338);

	doc.setFont('Playfair', 'italic');
	doc.setFontSize(13);
	color(MUTED);
	centred('has successfully completed the', 366);

	doc.setFont('Playfair', 'bold');
	fitSize(cert.courseName, 22, 600, 13);
	color(INK);
	centred(cert.courseName, 396);

	if (cert.courseDetails) {
		doc.setFont('Bebas', 'normal');
		doc.setFontSize(12);
		color(GOLD);
		centred(cert.courseDetails.toUpperCase(), 418, 2);
	}

	// --- Signature row ---
	const lineY = 500;
	const labelY = 514;
	const leftX = 205;
	const rightX = W - 205;

	function signatureColumn(
		x: number,
		value: string,
		font: { style: 'normal' | 'italic'; size: number },
		label: string
	) {
		doc.setFont('Playfair', font.style);
		doc.setFontSize(font.size);
		color(INK);
		doc.text(value, x, lineY - 8, { align: 'center' });
		stroke(INK);
		doc.setLineWidth(0.6);
		doc.line(x - 95, lineY, x + 95, lineY);
		doc.setFont('Bebas', 'normal');
		doc.setFontSize(10);
		color(MUTED);
		const width = doc.getTextWidth(label) + 1.5 * (label.length - 1);
		doc.text(label, x - width / 2, labelY, { charSpace: 1.5 });
	}

	signatureColumn(
		leftX,
		formatCertificateDate(cert.completedOn),
		{ style: 'normal', size: 14 },
		'DATE OF COMPLETION'
	);
	signatureColumn(
		rightX,
		cert.signatoryName ?? '',
		{ style: 'italic', size: 19 },
		(cert.signatoryRole || 'Authorised Signature').toUpperCase()
	);

	// QR code linking to the public verification page, drawn as vector squares
	const qr = QRCode.create(verifyUrl, { errorCorrectionLevel: 'M' });
	const qrSize = 62;
	const cell = qrSize / qr.modules.size;
	const qrX = cx - qrSize / 2;
	const qrY = 442;
	fill(INK);
	for (let row = 0; row < qr.modules.size; row++) {
		for (let col = 0; col < qr.modules.size; col++) {
			if (qr.modules.get(row, col)) {
				// A hair wider than the cell, so neighbouring squares don't leave seams
				doc.rect(qrX + col * cell, qrY + row * cell, cell + 0.15, cell + 0.15, 'F');
			}
		}
	}
	doc.setFont('Bebas', 'normal');
	doc.setFontSize(8);
	color(MUTED);
	centred('SCAN TO VERIFY', qrY + qrSize + 11, 1.5);

	// --- Footer ---
	doc.setFont('Bebas', 'normal');
	doc.setFontSize(9);
	color(MUTED);
	// Bebas Neue draws lowercase letters as capitals, so the link looks like the rest of
	// the footer but copies (and works) in lowercase
	centred(
		`CERTIFICATE NO. ${cert.code}     ·     VERIFY AT ${verifyUrl.replace(/^https?:\/\//, '').toLowerCase()}`,
		H - 44,
		1
	);

	return new Uint8Array(doc.output('arraybuffer'));
}
