import type {
	CodeType,
	FieldId,
	SourceType,
} from '@components/citation-builder/state';

export type Example = {
	label: string;
	sourceType: SourceType;
	codeType?: CodeType;
	fields: Partial<Record<FieldId, string>>;
};

// Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).
export const REPORTED_EXAMPLE: Example = {
	label: 'Reported case',
	sourceType: 'reported',
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
};

// Beaven v. Justice, No. 03-84-JBC, 2007 WL 1032301 (Mar. 30, 2007).
const UNREPORTED_EXAMPLE: Example = {
	label: 'Unreported case',
	sourceType: 'unreported',
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
};

// U.S.C. § 107 (2012).
const STATUTE_EXAMPLE: Example = {
	label: 'Statute',
	sourceType: 'statute',
	fields: {
		code: 'U.S.C.',
		section: '107',
		year: '2012',
	},
};

export const EXAMPLES: Example[] = [
	REPORTED_EXAMPLE,
	UNREPORTED_EXAMPLE,
	STATUTE_EXAMPLE,
];
