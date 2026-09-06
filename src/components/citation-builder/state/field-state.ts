import type { CaseTypeId } from '../domain/case-types';

// Every field the UI can show, across all three source types. Unlike
// CitationInput, this doesn't carry field values -- only the discriminant
// choices (§3.5: required/optional/not-used depends on selections made,
// never on the values typed into other fields).
export type FieldId =
	| 'caseType'
	| 'party1'
	| 'party2'
	| 'court'
	| 'pincite'
	| 'volume'
	| 'reporter'
	| 'firstPage'
	| 'availability'
	| 'docketNumber'
	| 'databaseIdentifier'
	| 'month'
	| 'day'
	| 'year'
	| 'codeType'
	| 'codeAbbreviation'
	| 'section'
	| 'publisher'
	| 'supplementDesignation'
	| 'supplementYear';

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections =
	| { sourceType: 'reported'; mode: 'full' | 'short'; caseType: CaseTypeId }
	| {
			sourceType: 'unreported';
			caseType: CaseTypeId;
			availabilityKind: 'database' | 'slip-opinion';
	  }
	| {
			sourceType: 'statute';
			codeType: 'official' | 'annotated';
			hasSupplementDesignation: boolean;
	  };

// r[impl field-state.derivation]
export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const isReported = selections.sourceType === 'reported';
	const isUnreported = selections.sourceType === 'unreported';
	const isStatute = selections.sourceType === 'statute';
	const isCaseType = isReported || isUnreported;

	const mode = isReported ? selections.mode : 'full';
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
		docketNumber: usedIf(isUnreported, 'required'),
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
