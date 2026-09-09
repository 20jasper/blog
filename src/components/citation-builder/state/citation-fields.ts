import type { CaseTypeId } from '../domain/case-types';
import type { DisplayState } from './display-state';
import type { Selections } from './field-state';
import { resolveFormShape } from './form-shape';

export type CitationFields = {
	caseType: CaseTypeId;
	party1: string;
	party2: string;
	court: string;
	pincite: string;

	volume: string;
	reporter: string;
	firstPage: string;
	year: string;
};

export function initialCitationFields(): CitationFields {
	return {
		caseType: 'v',
		party1: '',
		party2: '',
		court: '',
		pincite: '',

		volume: '',
		reporter: '',
		firstPage: '',
		year: '',
	};
}

export function deriveSelections(
	fields: CitationFields,
	display: DisplayState,
): Selections {
	return { formShape: resolveFormShape(display), caseType: fields.caseType };
}
