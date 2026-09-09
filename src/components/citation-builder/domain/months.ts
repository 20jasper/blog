// r[impl date.month-list]
export const MONTHS = [
	'Jan.',
	'Feb.',
	'Mar.',
	'Apr.',
	'May',
	'June',
	'July',
	'Aug.',
	'Sep.',
	'Oct.',
	'Nov.',
	'Dec.',
] as const;

export type Month = (typeof MONTHS)[number];
