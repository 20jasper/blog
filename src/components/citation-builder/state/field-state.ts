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
		caseType: isCaseType ? 'required' : 'not-used',
		party1: isCaseType ? 'required' : 'not-used',
		party2: isCaseType
			? caseTypeChoice === 'v'
				? 'required'
				: 'not-used'
			: 'not-used',
		court: isCaseType ? 'required' : 'not-used',
		pincite: isCaseType
			? mode === 'short'
				? 'required'
				: 'optional'
			: 'not-used',

		volume: isReported ? 'required' : 'not-used',
		reporter: isReported ? 'required' : 'not-used',
		firstPage: isReported ? 'required' : 'not-used',

		availability: isUnreported ? 'required' : 'not-used',
		docketNumber: isUnreported ? 'required' : 'not-used',
		databaseIdentifier: isUnreported
			? availabilityKind === 'database'
				? 'required'
				: 'not-used'
			: 'not-used',
		month: isUnreported ? 'required' : 'not-used',
		day: isUnreported ? 'required' : 'not-used',

		year: 'required',

		codeType: isStatute ? 'required' : 'not-used',
		codeAbbreviation: isStatute ? 'required' : 'not-used',
		section: isStatute ? 'required' : 'not-used',
		publisher: isStatute
			? codeType === 'annotated'
				? 'required'
				: 'not-used'
			: 'not-used',
		supplementDesignation: isStatute ? 'optional' : 'not-used',
		supplementYear: isStatute
			? hasSupplementDesignation
				? 'optional'
				: 'not-used'
			: 'not-used',
	};
}
