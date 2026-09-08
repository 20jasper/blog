import type { CaseNameInput } from '../domain/case-types';
import type {
	ReportedCaseInput,
	ReportedShortFormInput,
} from '../domain/assemble';
import type { CitationFields } from './citation-fields';
import type { CitationInput } from './citation-input';
import type { DisplayState } from './display-state';

// Number('') is 0, not NaN -- would bake a wrong number into the citation.
function parseRequiredInt(value: string, field: string): number {
	if (!/^\d+$/u.test(value)) {
		throw new Error(`invalid ${field}: ${value}`);
	}
	return Number(value);
}

function caseNameInput(fields: CitationFields): CaseNameInput {
	return fields.caseType === 'v'
		? { caseType: 'v', party1: fields.party1, party2: fields.party2 }
		: { caseType: fields.caseType, party1: fields.party1 };
}

function reportedFullInput(fields: CitationFields): ReportedCaseInput {
	return {
		name: caseNameInput(fields),
		volume: fields.volume,
		reporter: fields.reporter,
		firstPage: fields.firstPage,
		pincite: fields.pincite === '' ? undefined : fields.pincite,
		court: fields.court === '' ? undefined : fields.court,
		year: parseRequiredInt(fields.year, 'year'),
	};
}

// r[impl id.gating]
function reportedShortFormInput(
	fields: CitationFields,
	display: DisplayState,
): ReportedShortFormInput {
	if (display.useId) {
		return { nameVariant: 'id', pincite: fields.pincite };
	}
	const { nameVariant } = display;
	return nameVariant === 'none'
		? {
				nameVariant: 'none',
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			}
		: {
				nameVariant,
				name: caseNameInput(fields),
				volume: fields.volume,
				reporter: fields.reporter,
				pincite: fields.pincite,
			};
}

export function buildCitationInput(
	fields: CitationFields,
	display: DisplayState,
): CitationInput {
	const { mode } = display;
	return mode === 'full'
		? { mode, input: reportedFullInput(fields) }
		: { mode, input: reportedShortFormInput(fields, display) };
}
