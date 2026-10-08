/**
 * Opens the browser's print dialog for a PDF, without leaving the page.
 * Browsers that can't print a PDF from a hidden frame open it in a new tab
 * instead, where it can be printed from the PDF viewer.
 */
export function printPdf(url: string): Promise<void> {
	return new Promise((resolve) => {
		const frame = document.createElement('iframe');
		frame.style.cssText =
			'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
		frame.src = url;

		const fallback = () => {
			window.open(url, '_blank', 'noopener');
			frame.remove();
			resolve();
		};
		// Give up waiting if the PDF never finishes loading in the frame
		const timer = setTimeout(fallback, 8000);

		frame.onload = () => {
			clearTimeout(timer);
			try {
				frame.contentWindow?.focus();
				frame.contentWindow?.print();
				// Leave the frame long enough for the print dialog to use it
				setTimeout(() => frame.remove(), 60_000);
				resolve();
			} catch {
				fallback();
			}
		};
		document.body.appendChild(frame);
	});
}
