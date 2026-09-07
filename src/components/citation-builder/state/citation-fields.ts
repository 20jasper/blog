import type {
	Availability,
	MaterialLocation,
	StatuteInput,
} from '../domain/assemble';
import type { CaseTypeId } from '../domain/case-types';
import type { DisplayState } from './display-state';
import type { Selections } from './field-state';

export type SourceType = 'reported' | 'unreported' | 'statute';
// Derived from the domain types that actually consume them, so a new
// Availability/StatuteInput/MaterialLocation variant surfaces here at
// compile time instead of drifting from a hand-duplicated literal union.
export type AvailabilityKind = Availability['kind'];
export type CodeType = StatuteInput['codeType'];
export type MaterialLocationKind = MaterialLocation['kind'];

// One flat object -- fields unused by the active sourceType stay
// populated; switching type never clears a value. Matches
// docs/citation-builder/architecture-spec.md §6 item 2, using the
// domain's existing kebab-case CaseTypeId and field-state.ts's FieldId
// names rather than the spec's own draft naming, since those are what
// the rest of the code already consumes.
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
