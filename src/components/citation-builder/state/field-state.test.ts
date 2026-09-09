import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';
import type { FormShape } from './form-shape';

const FULL: FormShape = { mode: 'full' };
const SHORT_NAME: FormShape = {
	mode: 'short',
	kind: 'name',
	nameVariant: 'full',
};
const SHORT_ID: FormShape = { mode: 'short', kind: 'id' };
const SHORT_NONE: FormShape = { mode: 'short', kind: 'none' };

const BASE: Selections = { formShape: FULL, caseType: 'v' };

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
		[FULL, 'optional', 'optional'],
		[SHORT_NAME, 'not-used', 'required'],
	] as const)(
		'formShape %#: court %s, pincite %s',
		(formShape, court, pincite) => {
			const state = selectFieldState({ ...BASE, formShape });

			expect(state.court).toBe(court);
			expect(state.pincite).toBe(pincite);
		},
	);

	it.each(['volume', 'reporter'] as const)('%s is always required', (field) => {
		expect(selectFieldState({ ...BASE, formShape: FULL })[field]).toBe(
			'required',
		);
		expect(selectFieldState({ ...BASE, formShape: SHORT_NAME })[field]).toBe(
			'required',
		);
	});

	it.each(['firstPage', 'year'] as const)(
		'%s is required for full, not-used for short',
		(field) => {
			expect(selectFieldState({ ...BASE, formShape: FULL })[field]).toBe(
				'required',
			);
			expect(selectFieldState({ ...BASE, formShape: SHORT_NAME })[field]).toBe(
				'not-used',
			);
		},
	);
});

describe('selectFieldState: id. and nameVariant none drop the case name', () => {
	it('id shape marks party1/party2/volume/reporter not-used, even when caseType is v', () => {
		const state = selectFieldState({ formShape: SHORT_ID, caseType: 'v' });

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('not-used');
		expect(state.reporter).toBe('not-used');
		expect(state.pincite).toBe('required');
	});

	it('none shape marks party1/party2 not-used but keeps volume/reporter required', () => {
		const state = selectFieldState({ formShape: SHORT_NONE, caseType: 'v' });

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('required');
		expect(state.reporter).toBe('required');
	});

	it('full mode always requires the name regardless of shape details', () => {
		const state = selectFieldState({ formShape: FULL, caseType: 'v' });

		expect(state.party1).toBe('required');
		expect(state.party2).toBe('required');
	});
});
