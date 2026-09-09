import type { Availability } from '../domain/availability';
import type { CaseNameInput } from '../domain/case-types';
import type {
	ReportedCaseInput,
	ReportedShortFormInput,
	UnreportedCaseInput,
	UnreportedShortFormInput,
} from '../domain/assemble';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import type { DisplayState } from './display-state';
import { emptyToUndefined } from './empty-to-undefined';
import type { ShortFormShape } from './form-shape';
import { resolveSourceShape, type SourceShape } from './source-shape';

type UnreportedShape = Extract<SourceShape, { sourceType: 'unreported' }>;

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

type ReportedShape = Extract<SourceShape, { sourceType: 'reported' }>;

function reportedCitationInput(
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

function unreportedCitationInput(
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

export function buildCitationInput(
	fields: CitationFields,
	display: DisplayState,
): CitationInput {
	const sourceShape = resolveSourceShape(display);
	switch (sourceShape.sourceType) {
		case 'reported':
			return reportedCitationInput(fields, sourceShape);
		case 'unreported':
			return unreportedCitationInput(fields, sourceShape);
		case 'statute':
			throw new Error('statute citations are not yet supported');
	}
}
