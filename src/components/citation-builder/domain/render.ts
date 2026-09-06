import type { Emphasis, FramingOptions, Segment } from './types';

export type RenderOptions = {
	emphasis: Emphasis;
};

export type RenderResult = {
	html: string;
	plain: string;
};

function escapeHtml(text: string): string {
	// Order matters: '&' must go first, since the other two replacements
	// don't introduce new '&' characters that would otherwise get escaped.
	return text
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;');
}

// r[impl framing.parameter]
export function applyFraming(
	segments: Segment[],
	{ capitalizeFirst, terminalPeriod }: FramingOptions,
): Segment[] {
	if (segments.length === 0) {
		return segments;
	}

	const framed = segments.map((segment) => ({ ...segment }));
	const [first] = framed;
	const last = framed.at(-1);

	if (capitalizeFirst && first !== undefined && first.text.length > 0) {
		first.text = first.text[0]?.toUpperCase() + first.text.slice(1);
	}

	if (terminalPeriod && last !== undefined && !last.text.endsWith('.')) {
		last.text += '.';
	}

	return framed;
}

// r[impl segment.representation]
// r[impl segment.emphasis-is-abstract]
export function render(
	segments: Segment[],
	{ emphasis }: RenderOptions,
): RenderResult {
	const tag = emphasis === 'italic' ? 'i' : 'u';

	const html = segments
		.map((segment) => {
			const escaped = escapeHtml(segment.text);
			return segment.emphasized ? `<${tag}>${escaped}</${tag}>` : escaped;
		})
		.join('');

	const plain = segments.map((segment) => segment.text).join('');

	return { html, plain };
}
