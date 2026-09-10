import type {
	StatuteInput,
	StatuteShortFormInput,
} from '../domain/assemble-statute';
import type { MaterialLocation } from '../domain/material-location';
import type { StatuteDateInput } from '../domain/statute-date';
import { parseRequiredInt } from './citation-input-builders-shared';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import { emptyToUndefined } from './empty-to-undefined';
import type { SourceShape } from './source-shape';

type StatuteShape = Extract<SourceShape, { sourceType: 'statute' }>;
type StatuteFullShape = Extract<StatuteShape, { mode: 'full' }>;

function statuteDateInput(
	fields: CitationFields,
	materialLocation: MaterialLocation,
): StatuteDateInput {
	switch (materialLocation) {
		case 'main':
			return {
				materialLocation: 'main',
				year: parseRequiredInt(fields.year, 'year'),
			};
		case 'supplement':
			return {
				materialLocation: 'supplement',
				supplementDesignation: fields.supplementDesignation,
				supplementYear: parseRequiredInt(
					fields.supplementYear,
					'supplementYear',
				),
			};
		case 'both':
			return {
				materialLocation: 'both',
				year: parseRequiredInt(fields.year, 'year'),
				supplementDesignation: fields.supplementDesignation,
				supplementYear: parseRequiredInt(
					fields.supplementYear,
					'supplementYear',
				),
			};
	}
}

function statuteFullInput(
	fields: CitationFields,
	shape: StatuteFullShape,
): StatuteInput {
	return {
		popularName: emptyToUndefined(fields.popularName),
		originalSection: emptyToUndefined(fields.originalSection),
		title: emptyToUndefined(fields.title),
		code: fields.code,
		section: fields.section,
		publisher: shape.codeType === 'annotated' ? fields.publisher : undefined,
		...statuteDateInput(fields, shape.materialLocation),
	};
}

function statuteShortFormInput(fields: CitationFields): StatuteShortFormInput {
	return {
		title: emptyToUndefined(fields.title),
		code: fields.code,
		section: fields.section,
	};
}

export function statuteCitationInput(
	fields: CitationFields,
	shape: StatuteShape,
): CitationInput {
	switch (shape.mode) {
		case 'full':
			return {
				sourceType: 'statute',
				mode: 'full',
				input: statuteFullInput(fields, shape),
			};
		case 'short':
			return {
				sourceType: 'statute',
				mode: 'short',
				input: statuteShortFormInput(fields),
			};
	}
}
