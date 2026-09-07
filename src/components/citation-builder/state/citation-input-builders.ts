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

// Pattern-validated by checkValidity() first, so a non-digit value means
// a caller bug, not real input -- plain Number() silently returns 0 for
// '' rather than NaN, which would bake a wrong number into the citation.
function parseRequiredInt(value: string, field: string): number {
	if (!/^\d+$/u.test(value)) {
		throw new Error(`invalid ${field}: ${value}`);
	}
	return Number(value);
}

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
		year: parseRequiredInt(fields.year, 'year'),
	};
}

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
	// <select> only ever offers the 12 MONTHS options -- a non-Month value
	// here means a caller bug, not real input.
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
			day: parseRequiredInt(fields.day, 'day'),
			year: parseRequiredInt(fields.dateYear, 'dateYear'),
		},
	};
}

function unreportedShortFormAvailability(fields: CitationFields) {
	return fields.availability === 'database'
		? { kind: 'database' as const, databaseId: fields.databaseIdentifier }
		: { kind: 'slip-opinion' as const, docket: fields.docketNumber };
}

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

// Parsed lazily -- these may be blank when not-used for the branch.
function buildSupplement(fields: CitationFields) {
	return {
		designation: fields.supplementDesignation,
		year: parseRequiredInt(fields.supplementYear, 'supplementYear'),
	};
}

function buildMaterialLocation(fields: CitationFields): MaterialLocation {
	switch (fields.materialLocation) {
		case 'main-volume':
			return {
				kind: 'main-volume',
				year: parseRequiredInt(fields.codeYear, 'codeYear'),
			};
		case 'both':
			return {
				kind: 'both',
				year: parseRequiredInt(fields.codeYear, 'codeYear'),
				supplement: buildSupplement(fields),
			};
		case 'supplement-only':
			return { kind: 'supplement-only', supplement: buildSupplement(fields) };
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

function statuteShortFormInput(fields: CitationFields): StatuteShortFormInput {
	return {
		codeAbbreviation: fields.codeAbbreviation,
		section: fields.section,
	};
}

// r[impl field-state.derivation]
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
