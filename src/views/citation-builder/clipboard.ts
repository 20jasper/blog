export type LastCitation = { html: string; plain: string };

// r[impl copy.stale-permitted]
export function createClipboardController(
	button: HTMLButtonElement,
	output: HTMLElement,
) {
	let resetTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastCitation: LastCitation | undefined;

	function resetLabelSoon(): void {
		clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => {
			button.textContent = 'Copy';
		}, 2000);
	}

	function setCitation(citation: LastCitation | undefined): void {
		lastCitation = citation;
	}

	async function copy(): Promise<void> {
		if (lastCitation === undefined) {
			return;
		}
		const { html, plain } = lastCitation;
		try {
			await navigator.clipboard.write([
				new ClipboardItem({
					'text/html': new Blob([html], { type: 'text/html' }),
					'text/plain': new Blob([plain], { type: 'text/plain' }),
				}),
			]);
			button.textContent = 'Copied!';
		} catch {
			const selection = globalThis.getSelection();
			const range = document.createRange();
			range.selectNodeContents(output);
			selection?.removeAllRanges();
			selection?.addRange(range);
			button.textContent = 'Selected -- press Ctrl/Cmd+C';
		}
		resetLabelSoon();
	}

	return { copy, setCitation };
}
