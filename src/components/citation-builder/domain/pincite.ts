function commonPrefixLength(a: string, b: string): number {
	if (a.length !== b.length) {
		return 0;
	}
	const diffIndex = a.split('').findIndex((char, i) => char !== b[i]);
	return diffIndex === -1 ? a.length : diffIndex;
}

// r[impl normalize.span-digits]
export function reduceClosingPage(start: string, end: string): string {
	const prefix = commonPrefixLength(start, end);
	const keep = Math.max(2, end.length - prefix);
	return end.slice(-keep);
}

export const HYPHEN = '-';
export const EN_DASH = '–';

export type SpanSeparator = typeof HYPHEN | typeof EN_DASH;

export type PinciteOptions = {
	separator: SpanSeparator;
	starPages: boolean;
};

const SPAN = new RegExp(`^(\\d+)\\s*[${HYPHEN}${EN_DASH}]\\s*(\\d+)$`, 'u');

// r[impl normalize.span-input]
function normalizeSpan(component: string, separator: string): string {
	const match = SPAN.exec(component);
	if (match === null) {
		return component;
	}
	const [, start, end] = match;
	if (start === undefined || end === undefined) {
		return component;
	}
	return `${start}${separator}${reduceClosingPage(start, end)}`;
}

// r[impl normalize.span-nonconsecutive]
// r[impl normalize.span-passthrough]
// r[impl normalize.span-separator]
export function parsePincite(raw: string, opts: PinciteOptions): string {
	const components = raw
		.split(',')
		.map((component) => component.trim())
		.filter((component) => component.length > 0);

	const normalized = components.map((component) => {
		const text = normalizeSpan(component, opts.separator);
		return opts.starPages ? `*${text}` : text;
	});

	return normalized.join(', ');
}
