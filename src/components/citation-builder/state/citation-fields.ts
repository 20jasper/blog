import type { CaseTypeId } from '../domain/case-types';
import type { DisplayState } from './display-state';
import type { Selections } from './field-state';

export type SourceType = 'reported' | 'unreported' | 'statute';
export type AvailabilityKind = 'database' | 'slip-opinion';
export type CodeType = 'official' | 'annotated';

// One flat object -- fields unused by the active sourceType stay
// populated (§3.5: switching type never clears a value). Matches
// docs/citation-builder/phase-1-spec.md §10.2, using the domain's
// existing kebab-case CaseTypeId and field-state.ts's FieldId names
// rather than the spec's own draft naming, since those are what the
// rest of the code already consumes.
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

	codeType: CodeType;
	codeAbbreviation: string;
	section: string;
	publisher: string;
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

		codeType: 'official',
		codeAbbreviation: '',
		section: '',
		publisher: '',
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
				codeType: fields.codeType,
				hasSupplementDesignation: fields.supplementDesignation !== '',
			};
	}
}
