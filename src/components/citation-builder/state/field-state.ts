import type { CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';
import type { Mode } from './display-state';

export type FieldId = keyof CitationFields;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections = { mode: Mode; caseType: CaseTypeId };

export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const { mode, caseType } = selections;
	const isFull = mode === 'full';

	return {
		caseType: 'required',
		party1: 'required',
		party2: usedIf(caseType === 'v', 'required'),
		// r[impl court.optional]
		court: usedIf(isFull, 'optional'),
		pincite: mode === 'short' ? 'required' : 'optional',

		volume: 'required',
		reporter: 'required',
		firstPage: usedIf(isFull, 'required'),
		year: usedIf(isFull, 'required'),
	};
}
