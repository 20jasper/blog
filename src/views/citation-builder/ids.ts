// Ids exist only where HTML requires one: an explicit <label for> target,
// or <output for> pointing at the form. Everything else (rows to
// show/hide, the mode radios, the Id. checkbox, the Clear button) is
// found via name attributes, DOM structure, or role/label -- both in the
// view script and in the Playwright specs -- rather than a dedicated id.
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
} as const;

export type ElementIds = typeof ids;
