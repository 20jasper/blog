import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';

// r[verify field-state.derivation]
describe('selectFieldState: case identity', () => {
	it('party2 is required when caseType is v', () => {
		const selections: Selections = { mode: 'full', caseType: 'v' };

		expect(selectFieldState(selections).party2).toBe('required');
	});

	it.each(['in-re', 'ex-parte'] as const)(
		'party2 is not-used when caseType is %s',
		(caseType) => {
			const selections: Selections = { mode: 'full', caseType };

			expect(selectFieldState(selections).party2).toBe('not-used');
		},
	);

	it.each(['caseType', 'party1'] as const)('%s is always required', (field) => {
		const selections: Selections = { mode: 'full', caseType: 'v' };

		expect(selectFieldState(selections)[field]).toBe('required');
	});

	// r[verify court.optional]
	it('court is optional (not required), per r[court.optional]', () => {
		const selections: Selections = { mode: 'full', caseType: 'v' };

		expect(selectFieldState(selections).court).toBe('optional');
	});
});

describe('selectFieldState: mode affects court/pincite/volume/reporter/firstPage/year', () => {
	it.each([
		['full', 'optional', 'optional'],
		['short', 'not-used', 'required'],
	] as const)('mode %s -> court %s, pincite %s', (mode, court, pincite) => {
		const selections: Selections = { mode, caseType: 'v' };
		const state = selectFieldState(selections);

		expect(state.court).toBe(court);
		expect(state.pincite).toBe(pincite);
	});

	it.each(['volume', 'reporter'] as const)('%s is always required', (field) => {
		expect(selectFieldState({ mode: 'full', caseType: 'v' })[field]).toBe(
			'required',
		);
		expect(selectFieldState({ mode: 'short', caseType: 'v' })[field]).toBe(
			'required',
		);
	});

	it.each(['firstPage', 'year'] as const)(
		'%s is required for full, not-used for short',
		(field) => {
			expect(selectFieldState({ mode: 'full', caseType: 'v' })[field]).toBe(
				'required',
			);
			expect(selectFieldState({ mode: 'short', caseType: 'v' })[field]).toBe(
				'not-used',
			);
		},
	);
});
