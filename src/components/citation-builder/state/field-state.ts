import type { CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';
import type { Mode, NameVariant } from './display-state';

export type FieldId = keyof CitationFields;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections = {
	mode: Mode;
	caseType: CaseTypeId;
	nameVariant: NameVariant;
	useId: boolean;
};

export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const { mode, caseType, nameVariant, useId } = selections;
	const isFull = mode === 'full';
	// id. and nameVariant 'none' both produce a short form with no case name.
	const usesName = isFull || (!useId && nameVariant !== 'none');

	return {
		caseType: 'required',
		party1: usedIf(usesName, 'required'),
		party2: usedIf(usesName && caseType === 'v', 'required'),
		// r[impl court.optional]
		court: usedIf(isFull, 'optional'),
		pincite: mode === 'short' ? 'required' : 'optional',

		volume: usedIf(!useId, 'required'),
		reporter: usedIf(!useId, 'required'),
		firstPage: usedIf(isFull, 'required'),
		year: usedIf(isFull, 'required'),
	};
}
