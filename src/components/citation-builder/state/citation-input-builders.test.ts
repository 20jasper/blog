import { describe, expect, it } from 'vitest';
import {
	array,
	assert,
	constantFrom,
	integer,
	nat,
	oneof,
	property,
	string,
	tuple,
} from 'fast-check';
import { buildCitationInput } from './citation-input-builders';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

const digitString = array(integer({ min: 0, max: 9 }), {
	minLength: 1,
	maxLength: 6,
}).map((digits) => digits.join(''));

const adversarialChar = constantFrom('.', '-', ' ', 'a', '４', '٤');
const digitStringPlusOneBadChar = tuple(
	digitString,
	adversarialChar,
	nat(),
).map(([digits, char, position]) => {
	const insertAt = position % (digits.length + 1);
	return digits.slice(0, insertAt) + char + digits.slice(insertAt);
});
const notAllDigits = oneof(string(), digitStringPlusOneBadChar).filter(
	(value) => !/^\d+$/u.test(value),
);

function fullFields(year: string): CitationFields {
	return {
		...initialCitationFields(),
		party1: 'A',
		party2: 'B',
		volume: '1',
		reporter: 'R',
		firstPage: '2',
		year,
	};
}
const fullDisplay: DisplayState = { ...initialDisplayState(), mode: 'full' };

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
			sourceType: 'reported',
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
			sourceType: 'reported',
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
			sourceType: 'reported',
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
			sourceType: 'reported',
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

describe('buildCitationInput: unreported', () => {
	it('full form carries docket regardless of availability, databaseId only for database', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			docket: '05-1234',
			databaseId: '2005 WL 2709572',
			month: 'Oct.',
			day: '21',
			year: '2005',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'unreported',
			mode: 'full',
			availability: 'database',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				docket: '05-1234',
				pincite: undefined,
				court: undefined,
				month: 'Oct.',
				day: 21,
				year: 2005,
				availability: 'database',
				databaseId: '2005 WL 2709572',
			},
		});
	});

	it('slip availability omits databaseId entirely', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			party1: 'A',
			party2: 'B',
			docket: '05-1234',
			month: 'Oct.',
			day: '21',
			year: '2005',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'unreported',
			mode: 'full',
			availability: 'slip',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toMatchObject({
			input: { availability: 'slip', docket: '05-1234' },
		});
		expect(citation.input).not.toHaveProperty('databaseId');
	});

	it('short form with slip availability carries docket, not databaseId', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			docket: '05-1234',
			pincite: '2',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			sourceType: 'unreported',
			mode: 'short',
			nameVariant: 'none',
			availability: 'slip',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'short',
			input: {
				nameVariant: 'none',
				pincite: '2',
				availability: 'slip',
				docket: '05-1234',
			},
		});
	});
});

describe('buildCitationInput: numeric fields reject non-digit input', () => {
	it.each([
		[':', 'an ASCII symbol'],
		['４', 'a full-width Unicode digit, not ASCII 0-9'],
		['٤', 'an Arabic-Indic Unicode digit, not ASCII 0-9'],
	])('throws rather than producing NaN for year %s (%s)', (year) => {
		expect(() => buildCitationInput(fullFields(year), fullDisplay)).toThrow(
			'invalid year',
		);
	});

	it('parses any string of ASCII digits to the equal number', () => {
		assert(
			property(digitString, (year) => {
				const citation = buildCitationInput(fullFields(year), fullDisplay);
				expect(citation).toMatchObject({ input: { year: Number(year) } });
			}),
		);
	});

	it('throws for any string that is not all ASCII digits', () => {
		assert(
			property(notAllDigits, (year) => {
				expect(() => buildCitationInput(fullFields(year), fullDisplay)).toThrow(
					'invalid year',
				);
			}),
		);
	});
});
