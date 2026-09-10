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
	label: 'Dayton v. Stewart (reported)',
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

// State v. Lucko, No. 2021CA0007, 2021 WL 4269952, at *1-2 (Ohio Ct.
// App. Sept. 17, 2021).
export const UNREPORTED_EXAMPLE: Example = {
	label: 'State v. Lucko (unreported)',
	sourceType: 'unreported',
	fields: {
		caseType: 'v',
		party1: 'State',
		party2: 'Lucko',
		court: 'Ohio Ct. App.',
		docket: '2021CA0007',
		databaseId: '2021 WL 4269952',
		pincite: '1-2',
		month: 'Sep.',
		day: '17',
		year: '2021',
	},
};

// Ohio Rev. Code Ann. § 3767.32(A) (West 2025).
export const STATUTE_EXAMPLE: Example = {
	label: 'Ohio Rev. Code Ann. (statute)',
	sourceType: 'statute',
	codeType: 'annotated',
	fields: {
		code: 'Ohio Rev. Code Ann.',
		section: '3767.32(A)',
		publisher: 'West',
		year: '2025',
	},
};

export const EXAMPLES: readonly Example[] = [
	REPORTED_EXAMPLE,
	UNREPORTED_EXAMPLE,
	STATUTE_EXAMPLE,
];
