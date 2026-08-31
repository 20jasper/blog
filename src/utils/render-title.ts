const CODE_SPAN = /`([^`]+)`/gu;

function escapeHtml(text: string): string {
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

/**
 * Renders a post title's inline code spans to HTML, for use with `set:html`.
 * Titles have only ever used code spans (e.g. "Implement `Pick` in
 * TypeScript"), so this covers exactly that instead of pulling in a full
 * markdown parser for one construct.
 */
export function titleToHtml(title: string): string {
	return escapeHtml(title).replace(CODE_SPAN, '<code>$1</code>');
}

/**
 * Strips the backticks from a title's code spans down to plain text, for
 * contexts that can't hold HTML (the <title> tag, meta content attributes,
 * RSS/Atom item titles).
 */
export function titleToPlainText(title: string): string {
	return title.replace(CODE_SPAN, '$1');
}
