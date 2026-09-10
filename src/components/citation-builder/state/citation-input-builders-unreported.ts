import type { Availability } from '../domain/availability';
import type {
	UnreportedCaseInput,
	UnreportedShortFormInput,
} from '../domain/assemble';
import {
	caseNameInput,
	parseRequiredInt,
} from './citation-input-builders-shared';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import { emptyToUndefined } from './empty-to-undefined';
import type { ShortFormShape } from './form-shape';
import type { SourceShape } from './source-shape';

type UnreportedShape = Extract<SourceShape, { sourceType: 'unreported' }>;

function unreportedFullInput(
	fields: CitationFields,
	shape: UnreportedShape,
): UnreportedCaseInput {
	const base = {
		name: caseNameInput(fields),
		docket: fields.docket,
		pincite: emptyToUndefined(fields.pincite),
		court: emptyToUndefined(fields.court),
		month: fields.month,
		day: parseRequiredInt(fields.day, 'day'),
		year: parseRequiredInt(fields.year, 'year'),
	};
	switch (shape.availability) {
		case 'database':
			return {
				...base,
				availability: 'database',
				databaseId: fields.databaseId,
			};
		case 'slip':
			return { ...base, availability: 'slip' };
	}
}

function unreportedIdentifier(
	fields: CitationFields,
	availability: Availability,
):
	| { availability: 'database'; databaseId: string }
	| { availability: 'slip'; docket: string } {
	switch (availability) {
		case 'database':
			return { availability: 'database', databaseId: fields.databaseId };
		case 'slip':
			return { availability: 'slip', docket: fields.docket };
	}
}

// r[impl id.gating]
function unreportedShortFormInput(
	fields: CitationFields,
	shape: UnreportedShape,
	shortForm: ShortFormShape,
): UnreportedShortFormInput {
	switch (shortForm.kind) {
		case 'id':
			return {
				nameVariant: 'id',
				availability: shape.availability,
				pincite: fields.pincite,
			};
		case 'none':
			return {
				nameVariant: 'none',
				pincite: fields.pincite,
				...unreportedIdentifier(fields, shape.availability),
			};
		case 'name':
			return {
				nameVariant: shortForm.nameVariant,
				name: caseNameInput(fields),
				pincite: fields.pincite,
				...unreportedIdentifier(fields, shape.availability),
			};
	}
}

export function unreportedCitationInput(
	fields: CitationFields,
	shape: UnreportedShape,
): CitationInput {
	switch (shape.mode) {
		case 'full':
			return {
				sourceType: 'unreported',
				mode: 'full',
				input: unreportedFullInput(fields, shape),
			};
		case 'short':
			return {
				sourceType: 'unreported',
				mode: 'short',
				input: unreportedShortFormInput(fields, shape, shape),
			};
	}
}
