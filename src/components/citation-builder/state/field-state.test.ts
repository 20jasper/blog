import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';

const BASE: Selections = {
	mode: 'full',
	caseType: 'v',
	nameVariant: 'full',
	useId: false,
};

describe('selectFieldState: case identity', () => {
	it('party2 is required when caseType is v', () => {
		expect(selectFieldState(BASE).party2).toBe('required');
	});

	it.each(['in-re', 'ex-parte'] as const)(
		'party2 is not-used when caseType is %s',
		(caseType) => {
			const selections: Selections = { ...BASE, caseType };

			expect(selectFieldState(selections).party2).toBe('not-used');
		},
	);

	it.each(['caseType', 'party1'] as const)('%s is always required', (field) => {
		expect(selectFieldState(BASE)[field]).toBe('required');
	});

	// r[verify court.optional]
	it('court is optional (not required), per r[court.optional]', () => {
		expect(selectFieldState(BASE).court).toBe('optional');
	});
});

describe('selectFieldState: mode affects court/pincite/volume/reporter/firstPage/year', () => {
	it.each([
		['full', 'optional', 'optional'],
		['short', 'not-used', 'required'],
	] as const)('mode %s -> court %s, pincite %s', (mode, court, pincite) => {
		const state = selectFieldState({ ...BASE, mode });

		expect(state.court).toBe(court);
		expect(state.pincite).toBe(pincite);
	});

	it.each(['volume', 'reporter'] as const)('%s is always required', (field) => {
		expect(selectFieldState({ ...BASE, mode: 'full' })[field]).toBe('required');
		expect(selectFieldState({ ...BASE, mode: 'short' })[field]).toBe(
			'required',
		);
	});

	it.each(['firstPage', 'year'] as const)(
		'%s is required for full, not-used for short',
		(field) => {
			expect(selectFieldState({ ...BASE, mode: 'full' })[field]).toBe(
				'required',
			);
			expect(selectFieldState({ ...BASE, mode: 'short' })[field]).toBe(
				'not-used',
			);
		},
	);
});

describe('selectFieldState: id. and nameVariant none drop the case name', () => {
	it('useId marks party1/party2/volume/reporter not-used, even when caseType is v', () => {
		const state = selectFieldState({ ...BASE, mode: 'short', useId: true });

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('not-used');
		expect(state.reporter).toBe('not-used');
		expect(state.pincite).toBe('required');
	});

	it('nameVariant none marks party1/party2 not-used but keeps volume/reporter required', () => {
		const state = selectFieldState({
			...BASE,
			mode: 'short',
			nameVariant: 'none',
		});

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('required');
		expect(state.reporter).toBe('required');
	});

	it('full mode always requires the name regardless of nameVariant/useId', () => {
		const state = selectFieldState({
			...BASE,
			mode: 'full',
			nameVariant: 'none',
			useId: true,
		});

		expect(state.party1).toBe('required');
		expect(state.party2).toBe('required');
	});
});
