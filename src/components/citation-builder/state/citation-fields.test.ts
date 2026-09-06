import { describe, expect, it } from 'vitest';
import { deriveSelections, initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

// r[verify field-state.derivation]
describe('deriveSelections', () => {
	it.each([
		[
			'reported',
			{ sourceType: 'reported', caseType: 'v' },
			{ mode: 'full' },
			{ sourceType: 'reported', mode: 'full', caseType: 'v' },
		],
		[
			'unreported, database',
			{
				sourceType: 'unreported',
				caseType: 'in-re',
				availability: 'database',
			},
			{ mode: 'short' },
			{
				sourceType: 'unreported',
				mode: 'short',
				caseType: 'in-re',
				availabilityKind: 'database',
			},
		],
		[
			'unreported, slip-opinion',
			{
				sourceType: 'unreported',
				caseType: 'ex-parte',
				availability: 'slip-opinion',
			},
			{ mode: 'full' },
			{
				sourceType: 'unreported',
				mode: 'full',
				caseType: 'ex-parte',
				availabilityKind: 'slip-opinion',
			},
		],
		[
			'statute, no supplement',
			{
				sourceType: 'statute',
				codeType: 'official',
				supplementDesignation: '',
			},
			{},
			{
				sourceType: 'statute',
				codeType: 'official',
				hasSupplementDesignation: false,
			},
		],
		[
			'statute, with supplement',
			{
				sourceType: 'statute',
				codeType: 'annotated',
				supplementDesignation: 'Supp.',
			},
			{},
			{
				sourceType: 'statute',
				codeType: 'annotated',
				hasSupplementDesignation: true,
			},
		],
	] as const)('%s', (_label, fieldOverrides, displayOverrides, expected) => {
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
	it('starts every field blank, sourceType reported, caseType v', () => {
		const fields = initialCitationFields();

		expect(fields.sourceType).toBe('reported');
		expect(fields.caseType).toBe('v');
		expect(fields.party1).toBe('');
	});
});
