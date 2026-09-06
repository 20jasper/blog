import type { CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';

// Every field the UI can show, across all three source types -- derived
// from CitationFields rather than hand-listed, so a renamed or removed
// field fails at compile time here instead of silently going stale.
// Unlike CitationFields itself, this doesn't carry values -- only the
// discriminant choices (§3.5: required/optional/not-used depends on
// selections made, never on the values typed into other fields).
export type FieldId = Exclude<keyof CitationFields, 'sourceType'>;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections =
	| { sourceType: 'reported'; mode: 'full' | 'short'; caseType: CaseTypeId }
	| {
			sourceType: 'unreported';
			mode: 'full' | 'short';
			caseType: CaseTypeId;
			availabilityKind: 'database' | 'slip-opinion';
	  }
	| {
			sourceType: 'statute';
			codeType: 'official' | 'annotated';
			hasSupplementDesignation: boolean;
	  };

// r[impl citation.unreported-short-form]
function unreportedDocketState(
	mode: 'full' | 'short',
	availabilityKind: 'database' | 'slip-opinion',
): FieldRequirement {
	if (mode === 'full') {
		return 'required';
	}
	return availabilityKind === 'slip-opinion' ? 'required' : 'not-used';
}

// r[impl field-state.derivation]
export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const isReported = selections.sourceType === 'reported';
	const isUnreported = selections.sourceType === 'unreported';
	const isStatute = selections.sourceType === 'statute';
	const isCaseType = isReported || isUnreported;

	const mode = isReported || isUnreported ? selections.mode : 'full';
	const caseTypeChoice =
		isReported || isUnreported ? selections.caseType : undefined;
	const availabilityKind = isUnreported
		? selections.availabilityKind
		: undefined;
	const codeType = isStatute ? selections.codeType : undefined;
	const hasSupplementDesignation = isStatute
		? selections.hasSupplementDesignation
		: false;

	return {
		caseType: usedIf(isCaseType, 'required'),
		party1: usedIf(isCaseType, 'required'),
		party2: usedIf(isCaseType, usedIf(caseTypeChoice === 'v', 'required')),
		// r[impl court.optional]
		court: usedIf(isCaseType, 'optional'),
		pincite: usedIf(isCaseType, mode === 'short' ? 'required' : 'optional'),

		volume: usedIf(isReported, 'required'),
		reporter: usedIf(isReported, 'required'),
		firstPage: usedIf(isReported, 'required'),

		availability: usedIf(isUnreported, 'required'),
		docketNumber: usedIf(
			isUnreported,
			unreportedDocketState(mode, availabilityKind ?? 'database'),
		),
		databaseIdentifier: usedIf(
			isUnreported,
			usedIf(availabilityKind === 'database', 'required'),
		),
		month: usedIf(isUnreported, 'required'),
		day: usedIf(isUnreported, 'required'),

		year: 'required',

		codeType: usedIf(isStatute, 'required'),
		codeAbbreviation: usedIf(isStatute, 'required'),
		section: usedIf(isStatute, 'required'),
		publisher: usedIf(isStatute, usedIf(codeType === 'annotated', 'required')),
		supplementDesignation: usedIf(isStatute, 'optional'),
		supplementYear: usedIf(
			isStatute,
			usedIf(hasSupplementDesignation, 'optional'),
		),
	};
}
