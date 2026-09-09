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

// r[impl date.month-list]
export function isMonth(value: string): value is Month {
	return (MONTHS as readonly string[]).includes(value);
}
