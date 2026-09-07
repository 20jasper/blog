// Golden cases from docs/citation-builder/phase-1-spec.md §8.3, offered
// as Example buttons so a visitor sees a real, working citation for each
// source type instead of a blank form or just the default reported one.

// Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021) -- loaded
// on page load by default.
export const REPORTED_EXAMPLE = {
	caseType: 'v',
	party1: 'Dayton',
	party2: 'Stewart',
	court: 'Ohio Ct. App.',
	volume: '179',
	reporter: 'N.E.3d',
	firstPage: '208',
	pincite: '214',
	year: '2021',
} as const;

// State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1-2 (Ohio Ct. App.
// Sept. 17, 2021).
export const UNREPORTED_EXAMPLE = {
	caseType: 'v',
	party1: 'State',
	party2: 'Lucko',
	court: 'Ohio Ct. App.',
	docketNumber: '2021CA0007',
	databaseIdentifier: '2021 WL 4269952',
	pincite: '1-2',
	month: 'Sept.',
	day: '17',
	dateYear: '2021',
} as const;

// Ohio Rev. Code Ann. § 3767.32(A) (West 2025) -- the annotated variant
// of the same statute golden case.
export const STATUTE_EXAMPLE = {
	codeType: 'annotated',
	codeAbbreviation: 'Ohio Rev. Code Ann.',
	section: '3767.32(A)',
	publisher: 'West',
	materialLocation: 'main-volume',
	codeYear: '2025',
} as const;
