import type {
	Availability,
	MaterialLocation,
	StatuteInput,
} from '../domain/assemble';
import type { CaseTypeId } from '../domain/case-types';
import type { DisplayState } from './display-state';
import type { Selections } from './field-state';

export type SourceType = 'reported' | 'unreported' | 'statute';
// Derived from domain types so a new variant fails to compile, not drifts.
export type AvailabilityKind = Availability['kind'];
export type CodeType = StatuteInput['codeType'];
export type MaterialLocationKind = MaterialLocation['kind'];

// Unused fields stay populated; switching type never clears a value
// (architecture-spec.md §6 item 2). Names match existing code conventions.
export type CitationFields = {
	sourceType: SourceType;

	caseType: CaseTypeId;
	party1: string;
	party2: string;
	court: string;
	pincite: string;

	volume: string;
	reporter: string;
	firstPage: string;
	year: string;

	availability: AvailabilityKind;
	docketNumber: string;
	databaseIdentifier: string;
	month: string;
	day: string;
	dateYear: string;

	codeType: CodeType;
	codeAbbreviation: string;
	section: string;
	publisher: string;
	materialLocation: MaterialLocationKind;
	codeYear: string;
	supplementDesignation: string;
	supplementYear: string;
};

export function initialCitationFields(): CitationFields {
	return {
		sourceType: 'reported',

		caseType: 'v',
		party1: '',
		party2: '',
		court: '',
		pincite: '',

		volume: '',
		reporter: '',
		firstPage: '',
		year: '',

		availability: 'database',
		docketNumber: '',
		databaseIdentifier: '',
		month: '',
		day: '',
		dateYear: '',

		codeType: 'official',
		codeAbbreviation: '',
		section: '',
		publisher: '',
		materialLocation: 'main-volume',
		codeYear: '',
		supplementDesignation: '',
		supplementYear: '',
	};
}

// r[impl field-state.derivation]
export function deriveSelections(
	fields: CitationFields,
	display: DisplayState,
): Selections {
	switch (fields.sourceType) {
		case 'reported':
			return {
				sourceType: 'reported',
				mode: display.mode,
				caseType: fields.caseType,
			};
		case 'unreported':
			return {
				sourceType: 'unreported',
				mode: display.mode,
				caseType: fields.caseType,
				availabilityKind: fields.availability,
			};
		case 'statute':
			return {
				sourceType: 'statute',
				mode: display.mode,
				codeType: fields.codeType,
				materialLocation: fields.materialLocation,
			};
	}
}
