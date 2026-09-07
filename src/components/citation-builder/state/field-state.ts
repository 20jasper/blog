import type { CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';

// Derived from CitationFields, not hand-listed, so a renamed field fails
// to compile here instead of silently going stale.
export type FieldId = Exclude<keyof CitationFields, 'sourceType'>;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

type MaterialLocationKind = 'main-volume' | 'both' | 'supplement-only';

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
			mode: 'full' | 'short';
			codeType: 'official' | 'annotated';
			materialLocation: MaterialLocationKind;
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

// Both short forms drop court entirely; unreported full requires it
// (UnreportedCaseInput.court is non-optional, unlike ReportedCaseInput's).
// r[impl court.optional]
function courtState(
	isUnreported: boolean,
	mode: 'full' | 'short',
): FieldRequirement {
	if (mode === 'short') {
		return 'not-used';
	}
	return isUnreported ? 'required' : 'optional';
}

// r[impl field-state.derivation]
export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const isReported = selections.sourceType === 'reported';
	const isUnreported = selections.sourceType === 'unreported';
	const isStatute = selections.sourceType === 'statute';
	const isCaseType = isReported || isUnreported;

	const { mode } = selections;
	const isFull = mode === 'full';
	const caseTypeChoice =
		isReported || isUnreported ? selections.caseType : undefined;
	const availabilityKind = isUnreported
		? selections.availabilityKind
		: undefined;
	const codeType = isStatute ? selections.codeType : undefined;
	const materialLocation = isStatute ? selections.materialLocation : undefined;

	return {
		caseType: usedIf(isCaseType, 'required'),
		party1: usedIf(isCaseType, 'required'),
		party2: usedIf(isCaseType, usedIf(caseTypeChoice === 'v', 'required')),
		court: usedIf(isCaseType, courtState(isUnreported, mode)),
		pincite: usedIf(isCaseType, mode === 'short' ? 'required' : 'optional'),

		// Id. drops volume/reporter, but that's a display-state choice, not
		// modeled here. Only firstPage is genuinely full-only.
		volume: usedIf(isReported, 'required'),
		reporter: usedIf(isReported, 'required'),
		firstPage: usedIf(isReported, usedIf(mode === 'full', 'required')),

		availability: usedIf(isUnreported, 'required'),
		docketNumber: usedIf(
			isUnreported,
			unreportedDocketState(mode, availabilityKind ?? 'database'),
		),
		databaseIdentifier: usedIf(
			isUnreported,
			usedIf(availabilityKind === 'database', 'required'),
		),
		// Unreported short form has no date at all (domain-spec.md §5.8).
		month: usedIf(isUnreported, usedIf(mode === 'full', 'required')),
		day: usedIf(isUnreported, usedIf(mode === 'full', 'required')),
		dateYear: usedIf(isUnreported, usedIf(mode === 'full', 'required')),

		// "year" is the reported Decision year -- unreported has its own dateYear.
		year: usedIf(isReported, usedIf(mode === 'full', 'required')),

		// r[impl citation.statute-short-form] -- drops the whole parenthetical.
		codeAbbreviation: usedIf(isStatute, 'required'),
		section: usedIf(isStatute, 'required'),
		codeType: usedIf(isStatute, usedIf(isFull, 'required')),
		publisher: usedIf(
			isStatute,
			usedIf(isFull && codeType === 'annotated', 'required'),
		),
		// r[impl statute.material-location]
		materialLocation: usedIf(isStatute, usedIf(isFull, 'required')),
		// r[impl statute.material-location]
		codeYear: usedIf(
			isStatute,
			usedIf(isFull && materialLocation !== 'supplement-only', 'required'),
		),
		// r[impl statute.supplement-pairing]
		supplementDesignation: usedIf(
			isStatute,
			usedIf(isFull && materialLocation !== 'main-volume', 'required'),
		),
		supplementYear: usedIf(
			isStatute,
			usedIf(isFull && materialLocation !== 'main-volume', 'required'),
		),
	};
}
