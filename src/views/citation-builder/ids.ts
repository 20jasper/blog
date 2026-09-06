// Single source of truth for element ids: the markup and the Playwright
// specs both import this, so a renamed id fails at compile time in
// whichever side forgot to update, instead of silently passing a
// selector that never matches. Grows alongside the form.
export const ids = {
	heading: 'citation-builder-heading',
	intro: 'citation-builder-intro',

	form: 'citation-builder-form',
	caseType: 'citation-builder-case-type',
	party1: 'citation-builder-party1',
	party2: 'citation-builder-party2',
	party2Row: 'citation-builder-party2-row',
	court: 'citation-builder-court',
	volume: 'citation-builder-volume',
	reporter: 'citation-builder-reporter',
	firstPage: 'citation-builder-first-page',
	pincite: 'citation-builder-pincite',
	year: 'citation-builder-year',
	clearButton: 'citation-builder-clear',
	output: 'citation-builder-output',
} as const;

export type ElementIds = typeof ids;
