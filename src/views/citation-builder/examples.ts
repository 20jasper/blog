import type { DisplayState, FieldId } from '@components/citation-builder/state';

export type Example = {
	label: string;
	fields: Partial<Record<FieldId, string>>;
	display: Partial<DisplayState>;
};

// Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).
const REPORTED_EXAMPLE: Example = {
	label: 'Reported case',
	fields: {
		caseType: 'v',
		party1: 'Dayton',
		party2: 'Stewart',
		court: 'Ohio Ct. App.',
		volume: '179',
		reporter: 'N.E.3d',
		firstPage: '208',
		pincite: '214',
		year: '2021',
	},
	display: { sourceType: 'reported' },
};

// Beaven v. Justice, No. 03-84-JBC, 2007 WL 1032301 (Mar. 30, 2007).
const UNREPORTED_EXAMPLE: Example = {
	label: 'Unreported case',
	fields: {
		caseType: 'v',
		party1: 'Beaven',
		party2: 'Justice',
		docket: '03-84-JBC',
		databaseId: '2007 WL 1032301',
		month: 'Mar.',
		day: '30',
		year: '2007',
	},
	display: { sourceType: 'unreported', availability: 'database' },
};

// U.S.C. § 107 (2012).
const STATUTE_EXAMPLE: Example = {
	label: 'Statute',
	fields: {
		code: 'U.S.C.',
		section: '107',
		year: '2012',
	},
	display: {
		sourceType: 'statute',
		codeType: 'official',
		materialLocation: 'main',
	},
};

export const EXAMPLES: Example[] = [
	REPORTED_EXAMPLE,
	UNREPORTED_EXAMPLE,
	STATUTE_EXAMPLE,
];
