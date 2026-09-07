import { describe, expect, it } from 'vitest';
import { buildCitationInput } from './citation-input-builders';
import { initialCitationFields } from './citation-fields';
import { initialDisplayState } from './display-state';
import type { CitationFields } from './citation-fields';
import type { DisplayState } from './display-state';

// Full golden-case wording is verified in domain/*.test.ts and again via
// e2e; these focus on the transform logic that's unique to this module:
// caseType-dependent name shape, the Id./name-variant branching, empty
// -string-to-undefined coercion, and materialLocation's branch selection.
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
			sourceType: 'reported',
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

	it('coerces empty pincite/court to undefined for reported full', () => {
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

	it('useId drops volume/reporter/name for reported short form', () => {
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

	it('throws on an invalid month value', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			party1: 'A',
			party2: 'B',
			court: 'Ct.',
			availability: 'database',
			docketNumber: '1',
			databaseIdentifier: 'X',
			month: '',
			day: '1',
			dateYear: '2000',
			pincite: '2',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		expect(() => buildCitationInput(fields, display)).toThrow('invalid month');
	});

	it('builds a full unreported case with database availability', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			party1: 'State',
			party2: 'Lucko',
			court: 'Ct.',
			availability: 'database',
			docketNumber: '1',
			databaseIdentifier: 'X',
			month: 'Jan.',
			day: '1',
			dateYear: '2000',
			pincite: '2',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toMatchObject({
			input: { availability: { kind: 'database', databaseId: 'X' } },
		});
	});

	it('builds a full unreported case, coercing empty pincite to undefined', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			party1: 'State',
			party2: 'Lucko',
			court: 'Ct.',
			availability: 'slip-opinion',
			docketNumber: '1',
			month: 'Jan.',
			day: '1',
			dateYear: '2000',
			pincite: '',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'full',
			input: {
				name: { caseType: 'v', party1: 'State', party2: 'Lucko' },
				docket: '1',
				availability: { kind: 'slip-opinion' },
				pincite: undefined,
				court: 'Ct.',
				date: { month: 'Jan.', day: 1, year: 2000 },
			},
		});
	});

	it('nameVariant none drops the name for reported short form', () => {
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

	it('a non-id, non-none name variant carries the case name for reported short form', () => {
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

	it('a non-id, non-none name variant carries the case name for unreported short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			party1: 'A',
			party2: 'B',
			availability: 'database',
			databaseIdentifier: 'X',
			pincite: '3',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			nameVariant: 'party2',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'short',
			input: {
				nameVariant: 'party2',
				name: { caseType: 'v', party1: 'A', party2: 'B' },
				availability: { kind: 'database', databaseId: 'X' },
				pincite: '3',
			},
		});
	});

	it('nameVariant none carries slip-opinion availability for unreported short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			availability: 'slip-opinion',
			docketNumber: '1',
			pincite: '2',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			nameVariant: 'none',
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'short',
			input: {
				nameVariant: 'none',
				availability: { kind: 'slip-opinion', docket: '1' },
				pincite: '2',
			},
		});
	});

	it('useId keeps availability for unreported short form', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			availability: 'database',
			databaseIdentifier: 'X',
			pincite: '3',
		};
		const display: DisplayState = {
			...initialDisplayState(),
			mode: 'short',
			useId: true,
		};

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'unreported',
			mode: 'short',
			input: {
				nameVariant: 'id',
				availability: { kind: 'database', databaseId: 'X' },
				pincite: '3',
			},
		});
	});

	it.each([
		['main-volume', { kind: 'main-volume', year: 2000 }],
		[
			'both',
			{
				kind: 'both',
				year: 2000,
				supplement: { designation: 'Supp.', year: 2001 },
			},
		],
		[
			'supplement-only',
			{
				kind: 'supplement-only',
				supplement: { designation: 'Supp.', year: 2001 },
			},
		],
	] as const)(
		'materialLocation %s builds the matching domain shape',
		(materialLocation, expected) => {
			const fields: CitationFields = {
				...initialCitationFields(),
				sourceType: 'statute',
				codeType: 'official',
				codeAbbreviation: 'C.',
				section: '1',
				materialLocation,
				codeYear: '2000',
				supplementDesignation: 'Supp.',
				supplementYear: '2001',
			};
			const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

			const citation = buildCitationInput(fields, display);

			expect(citation).toMatchObject({
				input: { materialLocation: expected },
			});
		},
	);

	it('annotated statute full carries the publisher', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'statute',
			codeType: 'annotated',
			codeAbbreviation: 'C.',
			section: '1',
			publisher: 'West',
			materialLocation: 'main-volume',
			codeYear: '2000',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toMatchObject({
			input: { codeType: 'annotated', publisher: 'West' },
		});
	});

	it('statute short form carries only codeAbbreviation/section', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'statute',
			codeAbbreviation: 'C.',
			section: '1',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'short' };

		const citation = buildCitationInput(fields, display);

		expect(citation).toEqual({
			sourceType: 'statute',
			mode: 'short',
			input: { codeAbbreviation: 'C.', section: '1' },
		});
	});
});

// Fuzz-discovered: the numeric fields (year/day/dateYear/codeYear/
// supplementYear) used to go through plain Number(), which silently
// produces NaN for non-digit text -- baking "NaN" into the rendered
// citation -- since the DOM's inputmode="numeric" is only a keyboard
// hint, not validation. A fuzz run on this function with an arbitrary
// year string failed on its very first try ("year: ':'" -> NaN).
// Fixed by validating digit-only in parseRequiredInt() (and a matching
// pattern="[0-9]+" on the actual inputs) instead of coercing silently.
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

	it('throws rather than producing NaN for a non-numeric day', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'unreported',
			party1: 'A',
			party2: 'B',
			court: 'Ct.',
			availability: 'database',
			docketNumber: '1',
			databaseIdentifier: 'X',
			month: 'Jan.',
			day: 'abc',
			dateYear: '2000',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		expect(() => buildCitationInput(fields, display)).toThrow('invalid day');
	});

	it('throws rather than producing NaN for a non-numeric codeYear/supplementYear', () => {
		const fields: CitationFields = {
			...initialCitationFields(),
			sourceType: 'statute',
			codeType: 'official',
			codeAbbreviation: 'C.',
			section: '1',
			materialLocation: 'both',
			codeYear: 'x',
			supplementDesignation: 'Supp.',
			supplementYear: 'y',
		};
		const display: DisplayState = { ...initialDisplayState(), mode: 'full' };

		expect(() => buildCitationInput(fields, display)).toThrow(
			'invalid codeYear',
		);
	});
});
