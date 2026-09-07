import type { DateParts } from './types';

// A digit also ends the prefix ("No.05-1234"); a letter doesn't ("North-123").
const DOCKET_PREFIX = /^(?:case\s+no\.?|docket\s+no\.?|no\.?)(?=\s|$|\d)\s*/iu;

// r[impl normalize.docket]
export function normalizeDocketNumber(input: string): string {
	return `No. ${input.trim().replace(DOCKET_PREFIX, '')}`;
}

const SECTION_SYMBOL = /^(§§?)\s*/u;

// r[impl normalize.section]
export function normalizeSection(input: string): string {
	const trimmed = input.trim();
	const match = SECTION_SYMBOL.exec(trimmed);
	return match
		? `${match[1]} ${trimmed.slice(match[0].length)}`
		: `§ ${trimmed}`;
}

// r[impl normalize.date]
export function assembleDate({ month, day, year }: DateParts): string {
	return `${month} ${day}, ${year}`;
}
