import type { CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';
import type { FormShape } from './form-shape';

export type FieldId = keyof CitationFields;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections = { formShape: FormShape; caseType: CaseTypeId };

type NameAndSourceUse = { usesName: boolean; usesVolumeReporter: boolean };

function usageFor(formShape: FormShape): NameAndSourceUse {
	switch (formShape.mode) {
		case 'full':
			return { usesName: true, usesVolumeReporter: true };
		case 'short':
			switch (formShape.kind) {
				case 'id':
					return { usesName: false, usesVolumeReporter: false };
				case 'none':
					return { usesName: false, usesVolumeReporter: true };
				case 'name':
					return { usesName: true, usesVolumeReporter: true };
			}
	}
}

export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const { formShape, caseType } = selections;
	const isFull = formShape.mode === 'full';
	const { usesName, usesVolumeReporter } = usageFor(formShape);

	return {
		caseType: 'required',
		party1: usedIf(usesName, 'required'),
		party2: usedIf(usesName && caseType === 'v', 'required'),
		// r[impl court.optional]
		court: usedIf(isFull, 'optional'),
		pincite: isFull ? 'optional' : 'required',

		volume: usedIf(usesVolumeReporter, 'required'),
		reporter: usedIf(usesVolumeReporter, 'required'),
		firstPage: usedIf(isFull, 'required'),
		year: usedIf(isFull, 'required'),
	};
}
