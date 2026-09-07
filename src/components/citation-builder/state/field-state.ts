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

// Neither short-form domain type (ReportedShortFormInput,
// UnreportedShortFormInput) has a court field -- it drops out of both
// short forms entirely. Required (not merely optional) for unreported
// full, since UnreportedCaseInput.court is non-optional, unlike
// ReportedCaseInput's.
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

		// ReportedShortFormInput drops volume/reporter entirely for
		// nameVariant 'id' (Id. form), but that's a display-state choice,
		// not modeled here -- field-state keeps volume/reporter required
		// whenever reported, mirroring the full form's requirement. Only
		// firstPage is truly full-only: no ReportedShortFormInput variant
		// carries a first page at all.
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
		// Neither date field applies to unreported short form -- it has no
		// date at all (§5.8).
		month: usedIf(isUnreported, usedIf(mode === 'full', 'required')),
		day: usedIf(isUnreported, usedIf(mode === 'full', 'required')),
		dateYear: usedIf(isUnreported, usedIf(mode === 'full', 'required')),

		// "year" is the reported Decision year specifically -- absent from
		// reported short form (ReportedShortFormInput has no year) and
		// from unreported entirely (which has its own dateYear).
		year: usedIf(isReported, usedIf(mode === 'full', 'required')),

		// Short form (r[citation.statute-short-form]) drops the entire
		// parenthetical -- codeType, publisher, materialLocation, codeYear,
		// and any supplement -- keeping only codeAbbreviation/section.
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
