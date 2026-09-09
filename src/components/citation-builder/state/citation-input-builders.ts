import type { CaseNameInput } from '../domain/case-types';
import type {
	ReportedCaseInput,
	ReportedShortFormInput,
} from '../domain/assemble';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import type { DisplayState } from './display-state';
import { emptyToUndefined } from './empty-to-undefined';
import { resolveFormShape, type ShortFormShape } from './form-shape';

// Number('') is 0, not NaN -- would bake a wrong number into the citation.
function parseRequiredInt(value: string, field: string): number {
	if (!/^\d+$/u.test(value)) {
		throw new Error(`invalid ${field}: ${value}`);
	}
	return Number(value);
}

function caseNameInput(fields: CitationFields): CaseNameInput {
	switch (fields.caseType) {
		case 'v':
			return { caseType: 'v', party1: fields.party1, party2: fields.party2 };
		case 'in-re':
		case 'ex-parte':
			return { caseType: fields.caseType, party1: fields.party1 };
	}
}

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

export function buildCitationInput(
	fields: CitationFields,
	display: DisplayState,
): CitationInput {
	const formShape = resolveFormShape(display);
	switch (formShape.mode) {
		case 'full':
			return { mode: 'full', input: reportedFullInput(fields) };
		case 'short':
			return {
				mode: 'short',
				input: reportedShortFormInput(fields, formShape),
			};
	}
}
