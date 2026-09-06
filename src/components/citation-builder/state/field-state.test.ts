import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';

// r[verify field-state.derivation]
describe('selectFieldState: shared case-type fields', () => {
	it('party2 is required when caseType is v', () => {
		const selections: Selections = {
			sourceType: 'reported',
			mode: 'full',
			caseType: 'v',
		};

		expect(selectFieldState(selections).party2).toBe('required');
	});

	it.each(['in-re', 'ex-parte'] as const)(
		'party2 is not-used when caseType is %s',
		(caseType) => {
			const selections: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType,
			};

			expect(selectFieldState(selections).party2).toBe('not-used');
		},
	);

	it.each(['caseType', 'party1', 'court'] as const)(
		'%s is always required for a case-type source (reported/unreported)',
		(field) => {
			const selections: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};

			expect(selectFieldState(selections)[field]).toBe('required');
		},
	);
});

describe('selectFieldState: reported-only fields (§3.2)', () => {
	it.each(['volume', 'reporter', 'firstPage'] as const)(
		'%s is required for reported, not-used for unreported and statute',
		(field) => {
			const reported: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};
			const unreported: Selections = {
				sourceType: 'unreported',
				caseType: 'v',
				availabilityKind: 'database',
			};
			const statute: Selections = {
				sourceType: 'statute',
				codeType: 'official',
				hasSupplementDesignation: false,
			};

			expect(selectFieldState(reported)[field]).toBe('required');
			expect(selectFieldState(unreported)[field]).toBe('not-used');
			expect(selectFieldState(statute)[field]).toBe('not-used');
		},
	);
});

describe('selectFieldState: unreported-only fields (§3.3)', () => {
	it.each(['availability', 'docketNumber', 'month', 'day'] as const)(
		'%s is required for unreported, not-used for reported and statute',
		(field) => {
			const reported: Selections = {
				sourceType: 'reported',
				mode: 'full',
				caseType: 'v',
			};
			const unreported: Selections = {
				sourceType: 'unreported',
				caseType: 'v',
				availabilityKind: 'database',
			};
			const statute: Selections = {
				sourceType: 'statute',
				codeType: 'official',
				hasSupplementDesignation: false,
			};

			expect(selectFieldState(unreported)[field]).toBe('required');
			expect(selectFieldState(reported)[field]).toBe('not-used');
			expect(selectFieldState(statute)[field]).toBe('not-used');
		},
	);

	it.each([
		['database', 'required'],
		['slip-opinion', 'not-used'],
	] as const)(
		'availability %s -> databaseIdentifier %s',
		(availabilityKind, expected) => {
			const selections: Selections = {
				sourceType: 'unreported',
				caseType: 'v',
				availabilityKind,
			};

			expect(selectFieldState(selections).databaseIdentifier).toBe(expected);
		},
	);
});

describe('selectFieldState: statute-only fields (§3.4)', () => {
	const REPORTED: Selections = {
		sourceType: 'reported',
		mode: 'full',
		caseType: 'v',
	};
	const UNREPORTED: Selections = {
		sourceType: 'unreported',
		caseType: 'v',
		availabilityKind: 'database',
	};

	it.each(['codeType', 'codeAbbreviation', 'section'] as const)(
		'%s is required for statute, not-used for reported and unreported',
		(field) => {
			const statute: Selections = {
				sourceType: 'statute',
				codeType: 'official',
				hasSupplementDesignation: false,
			};

			expect(selectFieldState(statute)[field]).toBe('required');
			expect(selectFieldState(REPORTED)[field]).toBe('not-used');
			expect(selectFieldState(UNREPORTED)[field]).toBe('not-used');
		},
	);

	it.each([
		['official', 'not-used'],
		['annotated', 'required'],
	] as const)('codeType %s -> publisher %s', (codeType, expected) => {
		const selections: Selections = {
			sourceType: 'statute',
			codeType,
			hasSupplementDesignation: false,
		};

		expect(selectFieldState(selections).publisher).toBe(expected);
	});

	it('supplementDesignation is optional for statute regardless of whether it is filled', () => {
		const selections: Selections = {
			sourceType: 'statute',
			codeType: 'official',
			hasSupplementDesignation: false,
		};

		expect(selectFieldState(selections).supplementDesignation).toBe('optional');
	});

	it.each([
		[false, 'not-used'],
		[true, 'optional'],
	] as const)(
		'hasSupplementDesignation %s -> supplementYear %s',
		(hasSupplementDesignation, expected) => {
			const selections: Selections = {
				sourceType: 'statute',
				codeType: 'annotated',
				hasSupplementDesignation,
			};

			expect(selectFieldState(selections).supplementYear).toBe(expected);
		},
	);
});

describe('selectFieldState: year is universally required (§3.2/3.3/3.4)', () => {
	it.each([
		{ sourceType: 'reported', mode: 'full', caseType: 'v' },
		{ sourceType: 'unreported', caseType: 'v', availabilityKind: 'database' },
		{
			sourceType: 'statute',
			codeType: 'official',
			hasSupplementDesignation: false,
		},
	] as const satisfies Selections[])(
		'year is required for $sourceType',
		(selections) => {
			expect(selectFieldState(selections).year).toBe('required');
		},
	);
});

describe('selectFieldState: pincite mode rule (§3.1)', () => {
	it.each([
		['full', 'optional'],
		['short', 'required'],
	] as const)('mode %s -> pincite %s', (mode, expected) => {
		const selections: Selections = {
			sourceType: 'reported',
			mode,
			caseType: 'v',
		};

		expect(selectFieldState(selections).pincite).toBe(expected);
	});
});

describe('selectFieldState: case-type fields are not-used for statute', () => {
	it.each(['caseType', 'party1', 'party2', 'court', 'pincite'] as const)(
		'%s is not-used when sourceType is statute',
		(field) => {
			const selections: Selections = {
				sourceType: 'statute',
				codeType: 'official',
				hasSupplementDesignation: false,
			};

			expect(selectFieldState(selections)[field]).toBe('not-used');
		},
	);
});
