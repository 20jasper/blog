// Ids exist only where HTML requires one (<label for>, <output for>).
// Everything else is found via name/role/label instead.
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
	docketNumber: 'citation-builder-docket-number',
	databaseIdentifier: 'citation-builder-database-identifier',
	month: 'citation-builder-month',
	day: 'citation-builder-day',
	dateYear: 'citation-builder-date-year',
	codeAbbreviation: 'citation-builder-code-abbreviation',
	section: 'citation-builder-section',
	publisher: 'citation-builder-publisher',
	materialLocation: 'citation-builder-material-location',
	codeYear: 'citation-builder-code-year',
	supplementDesignation: 'citation-builder-supplement-designation',
	supplementYear: 'citation-builder-supplement-year',
	exampleSelect: 'citation-builder-example-select',
} as const;

export type ElementIds = typeof ids;
