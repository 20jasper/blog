import type { FramingOptions, Segment, Typeface } from './types';

export type RenderOptions = {
	typeface: Typeface;
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

	if (capitalizeFirst) {
		const [first] = framed;
		if (first !== undefined && first.text.length > 0) {
			first.text = first.text[0]?.toUpperCase() + first.text.slice(1);
		}
	}

	if (terminalPeriod) {
		const lastIndex = framed.length - 1;
		const last = framed[lastIndex];
		if (last !== undefined && !last.text.endsWith('.')) {
			last.text += '.';
		}
	}

	return framed;
}

// r[impl segment.representation]
export function render(
	segments: Segment[],
	{ typeface }: RenderOptions,
): RenderResult {
	const tag = typeface === 'italic' ? 'i' : 'u';

	const html = segments
		.map((segment) => {
			const escaped = escapeHtml(segment.text);
			return segment.italic ? `<${tag}>${escaped}</${tag}>` : escaped;
		})
		.join('');

	const plain = segments.map((segment) => segment.text).join('');

	return { html, plain };
}
