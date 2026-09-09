import { hasSecondParty, type CaseTypeId } from '../domain/case-types';
import type { CitationFields } from './citation-fields';
import type { FormShape } from './form-shape';
import type { SourceShape } from './source-shape';

export type FieldId = keyof CitationFields;

export type FieldRequirement = 'required' | 'optional' | 'not-used';

function usedIf(condition: boolean, value: FieldRequirement): FieldRequirement {
	return condition ? value : 'not-used';
}

export type Selections = { sourceShape: SourceShape; caseType: CaseTypeId };

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

const NOT_USED: Record<FieldId, FieldRequirement> = {
	caseType: 'not-used',
	party1: 'not-used',
	party2: 'not-used',
	court: 'not-used',
	pincite: 'not-used',
	volume: 'not-used',
	reporter: 'not-used',
	firstPage: 'not-used',
	year: 'not-used',
	docket: 'not-used',
	databaseId: 'not-used',
	month: 'not-used',
	day: 'not-used',
};

type NameFieldState = Pick<
	Record<FieldId, FieldRequirement>,
	'caseType' | 'party1' | 'party2'
>;

function nameFieldState(
	usesName: boolean,
	caseType: CaseTypeId,
): NameFieldState {
	return {
		caseType: 'required',
		party1: usedIf(usesName, 'required'),
		party2: usedIf(usesName && hasSecondParty(caseType), 'required'),
	};
}

function reportedFieldState(
	formShape: FormShape,
	caseType: CaseTypeId,
): Record<FieldId, FieldRequirement> {
	const isFull = formShape.mode === 'full';
	const { usesName, usesVolumeReporter } = usageFor(formShape);

	return {
		...NOT_USED,
		...nameFieldState(usesName, caseType),
		// r[impl court.optional]
		court: usedIf(isFull, 'optional'),
		pincite: isFull ? 'optional' : 'required',

		volume: usedIf(usesVolumeReporter, 'required'),
		reporter: usedIf(usesVolumeReporter, 'required'),
		firstPage: usedIf(isFull, 'required'),
		year: usedIf(isFull, 'required'),
	};
}

type UnreportedShape = Extract<SourceShape, { sourceType: 'unreported' }>;

// r[impl id.gating]
function usesIdentifier(shape: UnreportedShape): boolean {
	switch (shape.mode) {
		case 'full':
			return true;
		case 'short':
			return shape.kind !== 'id';
	}
}

// r[impl unreported.availability]
function unreportedFieldState(
	shape: UnreportedShape,
	caseType: CaseTypeId,
): Record<FieldId, FieldRequirement> {
	const isFull = shape.mode === 'full';
	const isDatabase = shape.availability === 'database';
	const { usesName } = usageFor(shape);
	const usesIdentifierFields = usesIdentifier(shape);

	return {
		...NOT_USED,
		...nameFieldState(usesName, caseType),
		court: usedIf(isFull, 'optional'),
		pincite: isFull ? 'optional' : 'required',

		// r[impl citation.unreported-long-form]
		// r[impl citation.unreported-short-form]
		docket: usedIf(usesIdentifierFields && (isFull || !isDatabase), 'required'),
		databaseId: usedIf(usesIdentifierFields && isDatabase, 'required'),
		month: usedIf(isFull, 'required'),
		day: usedIf(isFull, 'required'),
		year: usedIf(isFull, 'required'),
	};
}

export function selectFieldState(
	selections: Selections,
): Record<FieldId, FieldRequirement> {
	const { sourceShape, caseType } = selections;
	switch (sourceShape.sourceType) {
		case 'reported':
			return reportedFieldState(sourceShape, caseType);
		case 'unreported':
			return unreportedFieldState(sourceShape, caseType);
		case 'statute':
			return NOT_USED;
	}
}
