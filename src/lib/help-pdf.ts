import { helpSections, helpSubtitle, helpTitle, type HelpBlock } from '$lib/help-content';

type RGB = [number, number, number];

const INK: RGB = [30, 30, 30];
const MUTED: RGB = [110, 110, 110];
const ACCENT: RGB = [20, 20, 20];
const TIP_BG: RGB = [235, 245, 238];
const TIP_BAR: RGB = [34, 139, 84];
const WARN_BG: RGB = [253, 243, 226];
const WARN_BAR: RGB = [217, 119, 6];

/** Builds a formatted A4 PDF of the whole help guide and triggers a download. */
export async function downloadHelpPdf(fileName = 'Dashboard-User-Guide') {
	const { default: jsPDF } = await import('jspdf');

	const doc = new jsPDF({ unit: 'pt', format: 'a4' });
	const pageW = doc.internal.pageSize.getWidth();
	const pageH = doc.internal.pageSize.getHeight();
	const margin = 54;
	const contentW = pageW - margin * 2;
	const topY = 70;
	const bottomY = pageH - 60;
	let y = topY;

	const setText = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
	const setFill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);

	function newPage() {
		doc.addPage();
		y = topY;
	}

	function ensure(height: number) {
		if (y + height > bottomY) newPage();
	}

	/** Writes wrapped text line by line so it can flow across pages. */
	function write(text: string, x: number, width: number, size: number, lineH: number) {
		doc.setFontSize(size);
		const lines = doc.splitTextToSize(text, width) as string[];
		for (const line of lines) {
			ensure(lineH);
			doc.text(line, x, y);
			y += lineH;
		}
	}

	// ---------- Cover ----------
	setFill(ACCENT);
	doc.rect(0, 0, pageW, 260, 'F');
	doc.setFont('helvetica', 'bold');
	doc.setTextColor(255, 255, 255);
	doc.setFontSize(34);
	const titleLines = doc.splitTextToSize(helpTitle, contentW) as string[];
	doc.text(titleLines, margin, 130);
	doc.setFont('helvetica', 'normal');
	doc.setFontSize(13);
	doc.text(
		doc.splitTextToSize(helpSubtitle, contentW) as string[],
		margin,
		130 + titleLines.length * 40
	);

	setText(MUTED);
	doc.setFontSize(10);
	doc.text(
		`Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
		margin,
		290
	);

	// ---------- Contents ----------
	y = 340;
	doc.setFont('helvetica', 'bold');
	setText(INK);
	doc.setFontSize(16);
	doc.text('Contents', margin, y);
	y += 26;

	// page numbers are only known after rendering, so remember where each entry sits
	const tocEntries: { id: string; title: string; page: number; y: number }[] = [];
	doc.setFontSize(11);
	helpSections.forEach((s, i) => {
		doc.setFont('helvetica', 'normal');
		setText(INK);
		doc.text(`${i + 1}.  ${s.title}`, margin, y);
		tocEntries.push({ id: s.id, title: s.title, page: 1, y });
		y += 20;
	});

	// ---------- Body ----------
	const sectionPage = new Map<string, number>();

	function renderBlock(block: HelpBlock) {
		switch (block.type) {
			case 'p': {
				doc.setFont('helvetica', 'normal');
				setText(INK);
				write(block.text, margin, contentW, 11, 16);
				y += 8;
				break;
			}
			case 'steps':
			case 'list': {
				if (block.title) {
					ensure(40);
					doc.setFont('helvetica', 'bold');
					setText(INK);
					doc.setFontSize(12);
					doc.text(block.title, margin, y);
					y += 18;
				}
				const indent = 24;
				block.items.forEach((item, i) => {
					doc.setFont('helvetica', 'normal');
					doc.setFontSize(11);
					const lines = doc.splitTextToSize(item, contentW - indent) as string[];
					ensure(16 * Math.min(lines.length, 2));
					setText(ACCENT);
					doc.setFont('helvetica', 'bold');
					doc.text(block.type === 'steps' ? `${i + 1}.` : '•', margin + 6, y);
					doc.setFont('helvetica', 'normal');
					setText(INK);
					for (const line of lines) {
						ensure(16);
						doc.text(line, margin + indent, y);
						y += 16;
					}
					y += 3;
				});
				y += 6;
				break;
			}
			case 'tip':
			case 'warning': {
				const isTip = block.type === 'tip';
				const label = isTip ? 'Tip' : 'Warning';
				const pad = 10;
				doc.setFont('helvetica', 'normal');
				doc.setFontSize(10.5);
				const lines = doc.splitTextToSize(block.text, contentW - pad * 2 - 8) as string[];
				const boxH = pad * 2 + 14 + lines.length * 14;
				ensure(boxH + 8);
				setFill(isTip ? TIP_BG : WARN_BG);
				doc.rect(margin, y, contentW, boxH, 'F');
				setFill(isTip ? TIP_BAR : WARN_BAR);
				doc.rect(margin, y, 4, boxH, 'F');
				doc.setFont('helvetica', 'bold');
				setText(isTip ? TIP_BAR : WARN_BAR);
				doc.text(label, margin + pad + 4, y + pad + 8);
				doc.setFont('helvetica', 'normal');
				setText(INK);
				lines.forEach((line, i) => doc.text(line, margin + pad + 4, y + pad + 24 + i * 14));
				y += boxH + 12;
				break;
			}
		}
	}

	newPage();
	helpSections.forEach((section, i) => {
		// Sections flow on; only start a fresh page when there is little room left
		if (i > 0) {
			y += 24;
			ensure(180);
		}
		sectionPage.set(section.id, doc.getNumberOfPages());

		doc.setFont('helvetica', 'bold');
		setText(ACCENT);
		doc.setFontSize(20);
		const headLines = doc.splitTextToSize(`${i + 1}. ${section.title}`, contentW) as string[];
		doc.text(headLines, margin, y);
		y += headLines.length * 24;
		setFill(ACCENT);
		doc.rect(margin, y - 12, 48, 3, 'F');
		y += 6;

		doc.setFont('helvetica', 'italic');
		setText(MUTED);
		write(section.summary, margin, contentW, 11, 16);
		y += 10;

		section.blocks.forEach(renderBlock);
	});

	// ---------- Fill in contents page numbers (with links) ----------
	doc.setPage(1);
	doc.setFontSize(11);
	doc.setFont('helvetica', 'normal');
	for (const entry of tocEntries) {
		const page = sectionPage.get(entry.id) ?? 1;
		setText(MUTED);
		doc.text(String(page), pageW - margin, entry.y, { align: 'right' });
		doc.link(margin, entry.y - 12, contentW, 16, { pageNumber: page });
	}

	// ---------- Header / footer on every page except the cover ----------
	const total = doc.getNumberOfPages();
	for (let p = 2; p <= total; p++) {
		doc.setPage(p);
		doc.setFont('helvetica', 'normal');
		doc.setFontSize(9);
		setText(MUTED);
		doc.text(helpTitle, margin, 36);
		doc.setDrawColor(210, 210, 210);
		doc.line(margin, 44, pageW - margin, 44);
		doc.line(margin, pageH - 44, pageW - margin, pageH - 44);
		doc.text(`Page ${p} of ${total}`, pageW - margin, pageH - 28, { align: 'right' });
	}

	doc.setProperties({ title: helpTitle, subject: helpSubtitle });
	doc.save(`${fileName}.pdf`);
}
