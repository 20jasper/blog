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

// fc.string() alone rarely lands on "a valid digit string plus one stray
// character", which is exactly the shape a naive regex tweak breaks --
// insert an adversarial character into an otherwise-valid digit string so
// that case is actually well-represented, not left to chance.
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
