import { describe, expect, it } from 'vitest';
import { selectFieldState } from './field-state';
import type { Selections } from './field-state';
import type { SourceShape } from './source-shape';

const FULL: SourceShape = { sourceType: 'reported', mode: 'full' };
const SHORT_NAME: SourceShape = {
	sourceType: 'reported',
	mode: 'short',
	kind: 'name',
	nameVariant: 'full',
};
const SHORT_ID: SourceShape = {
	sourceType: 'reported',
	mode: 'short',
	kind: 'id',
};
const SHORT_NONE: SourceShape = {
	sourceType: 'reported',
	mode: 'short',
	kind: 'none',
};

const BASE: Selections = { sourceShape: FULL, caseType: 'v' };

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
		'sourceShape %#: court %s, pincite %s',
		(sourceShape, court, pincite) => {
			const state = selectFieldState({ ...BASE, sourceShape });

			expect(state.court).toBe(court);
			expect(state.pincite).toBe(pincite);
		},
	);

	it.each(['volume', 'reporter'] as const)('%s is always required', (field) => {
		expect(selectFieldState({ ...BASE, sourceShape: FULL })[field]).toBe(
			'required',
		);
		expect(selectFieldState({ ...BASE, sourceShape: SHORT_NAME })[field]).toBe(
			'required',
		);
	});

	it.each(['firstPage', 'year'] as const)(
		'%s is required for full, not-used for short',
		(field) => {
			expect(selectFieldState({ ...BASE, sourceShape: FULL })[field]).toBe(
				'required',
			);
			expect(
				selectFieldState({ ...BASE, sourceShape: SHORT_NAME })[field],
			).toBe('not-used');
		},
	);
});

describe('selectFieldState: id. and nameVariant none drop the case name', () => {
	it('id shape marks party1/party2/volume/reporter not-used, even when caseType is v', () => {
		const state = selectFieldState({ sourceShape: SHORT_ID, caseType: 'v' });

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('not-used');
		expect(state.reporter).toBe('not-used');
		expect(state.pincite).toBe('required');
	});

	it('none shape marks party1/party2 not-used but keeps volume/reporter required', () => {
		const state = selectFieldState({ sourceShape: SHORT_NONE, caseType: 'v' });

		expect(state.party1).toBe('not-used');
		expect(state.party2).toBe('not-used');
		expect(state.volume).toBe('required');
		expect(state.reporter).toBe('required');
	});

	it('full mode always requires the name regardless of shape details', () => {
		const state = selectFieldState({ sourceShape: FULL, caseType: 'v' });

		expect(state.party1).toBe('required');
		expect(state.party2).toBe('required');
	});
});

describe('selectFieldState: unreported and statute are not yet wired', () => {
	it.each(['unreported', 'statute'] as const)(
		'marks every reported field not-used for sourceType %s',
		(sourceType) => {
			const sourceShape: SourceShape = { sourceType, mode: 'full' };
			const state = selectFieldState({ sourceShape, caseType: 'v' });

			expect(state.party1).toBe('not-used');
			expect(state.volume).toBe('not-used');
		},
	);
});
