// r[impl segment.representation]
// r[impl segment.emphasis-is-abstract]
export type Segment = {
	text: string;
	emphasized: boolean;
};

export type Emphasis = 'italic' | 'underline';

export type FramingOptions = {
	capitalizeFirst: boolean;
	terminalPeriod: boolean;
};

// Table 12 month abbreviations. May/June/July are never abbreviated.
export const MONTHS = [
	'Jan.',
	'Feb.',
	'Mar.',
	'Apr.',
	'May',
	'June',
	'July',
	'Aug.',
	'Sept.',
	'Oct.',
	'Nov.',
	'Dec.',
] as const;

export type Month = (typeof MONTHS)[number];

export type DateParts = {
	month: Month;
	day: number;
	year: number;
};
