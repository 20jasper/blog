import type { CaseNameInput } from '../domain/case-types';
import type {
	MaterialLocation,
	ReportedCaseInput,
	ReportedShortFormInput,
	StatuteInput,
	StatuteShortFormInput,
	UnreportedCaseInput,
	UnreportedShortFormInput,
} from '../domain/assemble';
import { isMonth } from '../domain/types';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import type { DisplayState } from './display-state';

// Pure CitationFields (+ DisplayState for the Id./name-variant nuances
// selectFieldState doesn't model) -> domain assemble() input transforms.
// Kept out of the view so they're unit-testable without a DOM, mirroring
// how citation-fields.ts's deriveSelections already does this for
// Selections.

function caseNameInput(fields: CitationFields): CaseNameInput {
	return fields.caseType === 'v'
		? { caseType: 'v', party1: fields.party1, party2: fields.party2 }
		: { caseType: fields.caseType, party1: fields.party1 };
}

function reportedFullInput(fields: CitationFields): ReportedCaseInput {
	return {
		name: caseNameInput(fields),
		volume: fields.volume,
		reporter: fields.reporter,
		firstPage: fields.firstPage,
		pincite: fields.pincite === '' ? undefined : fields.pincite,
		court: fields.court === '' ? undefined : fields.court,
		year: Number(fields.year),
	};
}

// Id. (ReportedShortFormInput's 'id' variant) carries neither
// volume/reporter nor a name -- only pincite.
function reportedShortFormInput(
	fields: CitationFields,
	display: DisplayState,
): ReportedShortFormInput {
	if (display.useId) {
		return { nameVariant: 'id', pincite: fields.pincite };
	}
	const { nameVariant } = display;
	return nameVariant === 'none'
		? {
				nameVariant: 'none',
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			}
		: {
				nameVariant,
				name: caseNameInput(fields),
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			};
}

function unreportedFullInput(fields: CitationFields): UnreportedCaseInput {
	// The month <select> only ever offers the 12 MONTHS options (no blank
	// one), and this is only called after form.checkValidity() -- so a
	// non-Month value here means a caller bug, not a real input to handle.
	if (!isMonth(fields.month)) {
		throw new Error(`invalid month: ${fields.month}`);
	}

	return {
		name: caseNameInput(fields),
		docket: fields.docketNumber,
		availability:
			fields.availability === 'database'
				? { kind: 'database', databaseId: fields.databaseIdentifier }
				: { kind: 'slip-opinion' },
		pincite: fields.pincite === '' ? undefined : fields.pincite,
		court: fields.court,
		date: {
			month: fields.month,
			day: Number(fields.day),
			year: Number(fields.dateYear),
		},
	};
}

function unreportedShortFormAvailability(fields: CitationFields) {
	return fields.availability === 'database'
		? { kind: 'database' as const, databaseId: fields.databaseIdentifier }
		: { kind: 'slip-opinion' as const, docket: fields.docketNumber };
}

// Id.'s 'id' variant keeps availability (unlike reported short form,
// which drops volume/reporter entirely) but drops the name.
function unreportedShortFormInput(
	fields: CitationFields,
	display: DisplayState,
): UnreportedShortFormInput {
	if (display.useId) {
		return {
			nameVariant: 'id',
			availability: unreportedShortFormAvailability(fields),
			pincite: fields.pincite,
		};
	}
	const { nameVariant } = display;
	return nameVariant === 'none'
		? {
				nameVariant: 'none',
				availability: unreportedShortFormAvailability(fields),
				pincite: fields.pincite,
			}
		: {
				nameVariant,
				name: caseNameInput(fields),
				availability: unreportedShortFormAvailability(fields),
				pincite: fields.pincite,
			};
}

function buildMaterialLocation(fields: CitationFields): MaterialLocation {
	const supplement = {
		designation: fields.supplementDesignation,
		year: Number(fields.supplementYear),
	};
	switch (fields.materialLocation) {
		case 'main-volume':
			return { kind: 'main-volume', year: Number(fields.codeYear) };
		case 'both':
			return { kind: 'both', year: Number(fields.codeYear), supplement };
		case 'supplement-only':
			return { kind: 'supplement-only', supplement };
	}
}

function statuteFullInput(fields: CitationFields): StatuteInput {
	const materialLocation = buildMaterialLocation(fields);
	return fields.codeType === 'annotated'
		? {
				codeType: 'annotated',
				codeAbbreviation: fields.codeAbbreviation,
				section: fields.section,
				publisher: fields.publisher,
				materialLocation,
			}
		: {
				codeType: 'official',
				codeAbbreviation: fields.codeAbbreviation,
				section: fields.section,
				materialLocation,
			};
}

// Short form drops codeType/publisher/materialLocation/supplement
// entirely (r[citation.statute-short-form]).
function statuteShortFormInput(fields: CitationFields): StatuteShortFormInput {
	return {
		codeAbbreviation: fields.codeAbbreviation,
		section: fields.section,
	};
}

// r[impl field-state.derivation] -- mirrors deriveSelections' switch
// shape, but builds the domain assemble() input rather than the
// field-requirement selector.
export function buildCitationInput(
	fields: CitationFields,
	display: DisplayState,
): CitationInput {
	const { mode } = display;

	switch (fields.sourceType) {
		case 'unreported':
			return mode === 'full'
				? { sourceType: 'unreported', mode, input: unreportedFullInput(fields) }
				: {
						sourceType: 'unreported',
						mode,
						input: unreportedShortFormInput(fields, display),
					};
		case 'statute':
			return mode === 'full'
				? { sourceType: 'statute', mode, input: statuteFullInput(fields) }
				: {
						sourceType: 'statute',
						mode,
						input: statuteShortFormInput(fields),
					};
		case 'reported':
			return mode === 'full'
				? { sourceType: 'reported', mode, input: reportedFullInput(fields) }
				: {
						sourceType: 'reported',
						mode,
						input: reportedShortFormInput(fields, display),
					};
	}
}
