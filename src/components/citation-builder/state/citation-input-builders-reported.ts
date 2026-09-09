import type {
	ReportedCaseInput,
	ReportedShortFormInput,
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

function reportedFullInput(fields: CitationFields): ReportedCaseInput {
	return {
		name: caseNameInput(fields),
		volume: fields.volume,
		reporter: fields.reporter,
		firstPage: fields.firstPage,
		pincite: emptyToUndefined(fields.pincite),
		court: emptyToUndefined(fields.court),
		year: parseRequiredInt(fields.year, 'year'),
	};
}

// r[impl id.gating]
function reportedShortFormInput(
	fields: CitationFields,
	shortForm: ShortFormShape,
): ReportedShortFormInput {
	switch (shortForm.kind) {
		case 'id':
			return { nameVariant: 'id', pincite: fields.pincite };
		case 'none':
			return {
				nameVariant: 'none',
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			};
		case 'name':
			return {
				nameVariant: shortForm.nameVariant,
				name: caseNameInput(fields),
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			};
	}
}

type ReportedShape = Extract<SourceShape, { sourceType: 'reported' }>;

export function reportedCitationInput(
	fields: CitationFields,
	shape: ReportedShape,
): CitationInput {
	switch (shape.mode) {
		case 'full':
			return {
				sourceType: 'reported',
				mode: 'full',
				input: reportedFullInput(fields),
			};
		case 'short':
			return {
				sourceType: 'reported',
				mode: 'short',
				input: reportedShortFormInput(fields, shape),
			};
	}
}
