import type { CaseNameInput } from '../domain/case-types';
import type { CitationFields } from './citation-fields';

// Number('') is 0, not NaN -- would bake a wrong number into the citation.
export function parseRequiredInt(value: string, field: string): number {
	if (!/^\d+$/u.test(value)) {
		throw new Error(`invalid ${field}: ${value}`);
	}
	return Number(value);
}

export function caseNameInput(fields: CitationFields): CaseNameInput {
	switch (fields.caseType) {
		case 'v':
			return { caseType: 'v', party1: fields.party1, party2: fields.party2 };
		case 'in-re':
		case 'ex-parte':
			return { caseType: fields.caseType, party1: fields.party1 };
	}
}
