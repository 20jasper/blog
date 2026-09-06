import type { DateParts } from './types';

// Rule 10.8.1. Widened lookahead vs. the original spec draft -- see
// docs/citation-builder/phase-1-spec.md §4.1 for why a digit also counts
// as a valid boundary (fixes "No.05-1234"), while a following letter
// still fails it (guards "North-123" -> "No. rth-123").
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
