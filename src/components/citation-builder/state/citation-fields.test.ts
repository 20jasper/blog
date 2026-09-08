import { describe, expect, it } from 'vitest';
import { deriveSelections, initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

describe('deriveSelections', () => {
	it.each([
		[{ caseType: 'v' }, { mode: 'full' }, { mode: 'full', caseType: 'v' }],
		[
			{ caseType: 'in-re' },
			{ mode: 'short' },
			{ mode: 'short', caseType: 'in-re' },
		],
	] as const)('%o + %o -> %o', (fieldOverrides, displayOverrides, expected) => {
		const fields: CitationFields = {
			...initialCitationFields(),
			...fieldOverrides,
		};
		const display: DisplayState = {
			...initialDisplayState(),
			...displayOverrides,
		};

		expect(deriveSelections(fields, display)).toEqual(expected);
	});
});

describe('initialCitationFields', () => {
	it('starts every field blank, caseType v', () => {
		const fields = initialCitationFields();

		expect(fields.caseType).toBe('v');
		expect(fields.party1).toBe('');
	});
});
