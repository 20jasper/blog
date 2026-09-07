import { describe, expect, it } from 'vitest';
import { buildCitationInput } from './citation-input-builders';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

describe('buildCitationInput', () => {
	it('drops party2 for non-v case types', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			caseType: 'in-re',
			party1: 'Smith',
			volume: '1',
			reporter: 'R',
			firstPage: '2',
			year: '2000',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toMatchObject({
			mode: 'full',
			input: { name: { caseType: 'in-re', party1: 'Smith' } },
		});
	});

	it('builds a full reported case with pincite/court present', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			volume: '1',
			reporter: 'R',
			firstPage: '2',
			year: '2000',
			pincite: '3',
			court: 'Ct.',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				volume: '1',
				reporter: 'R',
				firstPage: '2',
				pincite: '3',
				court: 'Ct.',
				year: 2000,
			},
		});
	});

	it('coerces empty pincite/court to undefined for full', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			volume: '1',
			reporter: 'R',
			firstPage: '2',
			year: '2000',
			pincite: '',
			court: '',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toMatchObject({
			input: { pincite: undefined, court: undefined },
		});
	});

	it('useId drops volume/reporter/name for short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			volume: '1',
			reporter: 'R',
			pincite: '3',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			useId: true,
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			mode: 'short',
			input: { nameVariant: 'id', pincite: '3' },
		});
	});

	it('nameVariant none drops the name for short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			volume: '1',
			reporter: 'R',
			pincite: '3',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			nameVariant: 'none',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			mode: 'short',
			input: { nameVariant: 'none', volume: '1', reporter: 'R', pincite: '3' },
		});
	});

	it('a non-id, non-none name variant carries the case name for short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			volume: '1',
			reporter: 'R',
			pincite: '3',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			nameVariant: 'party1',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			mode: 'short',
			input: {
				nameVariant: 'party1',
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				volume: '1',
				reporter: 'R',
				pincite: '3',
			},
		});
	});
});

describe('buildCitationInput: numeric fields reject non-digit input', () => {
	it('throws rather than producing NaN for a non-numeric year', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			volume: '1',
			reporter: 'R',
			firstPage: '2',
			year: ':',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		expect(() => buildCitationInput(fields, display)).toThrow('invalid year');
	});
});
