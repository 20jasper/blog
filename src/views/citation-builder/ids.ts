export const ids = {
	form: 'citation-builder-form',
	caseType: 'citation-builder-case-type',
	party1: 'citation-builder-party1',
	party2: 'citation-builder-party2',
	court: 'citation-builder-court',
	volume: 'citation-builder-volume',
	reporter: 'citation-builder-reporter',
	firstPage: 'citation-builder-first-page',
	pincite: 'citation-builder-pincite',
	year: 'citation-builder-year',
	nameVariant: 'citation-builder-name-variant',
} as const;

export type ElementIds = typeof ids;
