import type { CaseTypeId } from '../domain/case-types';
import type { Month } from '../domain/months';
import type { DisplayState } from './display-state';
import type { Selections } from './field-state';
import { resolveSourceShape } from './source-shape';

export type CitationFields = {
	caseType: CaseTypeId;
	party1: string;
	party2: string;
	court: string;
	pincite: string;
	weightOfAuthority: string;
	historyPhrase: string;
	historyCitation: string;

	volume: string;
	reporter: string;
	firstPage: string;
	year: string;

	docket: string;
	databaseId: string;
	url: string;
	month: Month;
	day: string;

	popularName: string;
	originalSection: string;
	title: string;
	code: string;
	section: string;
	publisher: string;
	supplementDesignation: string;
	supplementYear: string;
};

export function initialCitationFields(): CitationFields {
	return {
		caseType: 'v',
		party1: '',
		party2: '',
		court: '',
		pincite: '',
		weightOfAuthority: '',
		historyPhrase: '',
		historyCitation: '',

		volume: '',
		reporter: '',
		firstPage: '',
		year: '',

		docket: '',
		databaseId: '',
		url: '',
		month: 'Jan.',
		day: '',

		popularName: '',
		originalSection: '',
		title: '',
		code: '',
		section: '',
		publisher: '',
		supplementDesignation: '',
		supplementYear: '',
	};
}

export function deriveSelections(
	fields: CitationFields,
	display: DisplayState,
): Selections {
	return {
		sourceShape: resolveSourceShape(display),
		caseType: fields.caseType,
	};
}
