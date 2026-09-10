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

// r[verify unreported.availability]
describe('selectFieldState: unreported', () => {
	it.each([
		['database', 'required', 'required'],
		['slip', 'required', 'not-used'],
	] as const)(
		'full form, availability %s -> docket %s, databaseId %s',
		(availability, docket, databaseId) => {
			const sourceShape: SourceShape = {
				sourceType: 'unreported',
				mode: 'full',
				availability,
			};
			const state = selectFieldState({ sourceShape, caseType: 'v' });

			expect(state.docket).toBe(docket);
			expect(state.databaseId).toBe(databaseId);
		},
	);

	it.each([
		['database', 'not-used', 'required'],
		['slip', 'required', 'not-used'],
	] as const)(
		'short form, availability %s -> docket %s, databaseId %s',
		(availability, docket, databaseId) => {
			const sourceShape: SourceShape = {
				sourceType: 'unreported',
				mode: 'short',
				kind: 'none',
				availability,
			};
			const state = selectFieldState({ sourceShape, caseType: 'v' });

			expect(state.docket).toBe(docket);
			expect(state.databaseId).toBe(databaseId);
		},
	);

	it.each(['database', 'slip'] as const)(
		'Id. drops docket and databaseId entirely, availability %s',
		(availability) => {
			const sourceShape: SourceShape = {
				sourceType: 'unreported',
				mode: 'short',
				kind: 'id',
				availability,
			};
			const state = selectFieldState({ sourceShape, caseType: 'v' });

			expect(state.docket).toBe('not-used');
			expect(state.databaseId).toBe('not-used');
			expect(state.pincite).toBe('required');
		},
	);

	it('requires month/day/year only for full, never for short', () => {
		const full = selectFieldState({
			sourceShape: {
				sourceType: 'unreported',
				mode: 'full',
				availability: 'database',
			},
			caseType: 'v',
		});
		const short = selectFieldState({
			sourceShape: {
				sourceType: 'unreported',
				mode: 'short',
				kind: 'none',
				availability: 'database',
			},
			caseType: 'v',
		});

		expect(full.month).toBe('required');
		expect(full.day).toBe('required');
		expect(full.year).toBe('required');
		expect(short.month).toBe('not-used');
		expect(short.day).toBe('not-used');
		expect(short.year).toBe('not-used');
	});

	it('reuses reported-case name/pincite semantics unchanged', () => {
		const state = selectFieldState({
			sourceShape: {
				sourceType: 'unreported',
				mode: 'full',
				availability: 'database',
			},
			caseType: 'v',
		});

		expect(state.party1).toBe('required');
		expect(state.party2).toBe('required');
		expect(state.pincite).toBe('optional');
	});
});

describe('selectFieldState: statute', () => {
	it('marks every reported/unreported field not-used', () => {
		const sourceShape: SourceShape = {
			sourceType: 'statute',
			mode: 'full',
			codeType: 'official',
			materialLocation: 'main',
		};
		const state = selectFieldState({ sourceShape, caseType: 'v' });

		expect(state.party1).toBe('not-used');
		expect(state.volume).toBe('not-used');
		expect(state.docket).toBe('not-used');
	});

	// r[verify statute.publisher]
	it.each(['official', 'annotated'] as const)(
		'publisher required only when codeType is annotated (%s)',
		(codeType) => {
			const state = selectFieldState({
				sourceShape: {
					sourceType: 'statute',
					mode: 'full',
					codeType,
					materialLocation: 'main',
				},
				caseType: 'v',
			});

			expect(state.publisher).toBe(
				codeType === 'annotated' ? 'required' : 'not-used',
			);
		},
	);

	// r[verify statute.material-location]
	// r[verify statute.supplement-pairing]
	it.each([
		['main', 'required', 'not-used'],
		['both', 'required', 'required'],
		['supplement', 'not-used', 'required'],
	] as const)(
		'materialLocation %s -> year %s, supplement fields %s',
		(materialLocation, year, supplement) => {
			const state = selectFieldState({
				sourceShape: {
					sourceType: 'statute',
					mode: 'full',
					codeType: 'official',
					materialLocation,
				},
				caseType: 'v',
			});

			expect(state.year).toBe(year);
			expect(state.supplementDesignation).toBe(supplement);
			expect(state.supplementYear).toBe(supplement);
		},
	);

	it('short form drops publisher/year/supplement/popularName, keeps title/code/section', () => {
		const state = selectFieldState({
			sourceShape: { sourceType: 'statute', mode: 'short' },
			caseType: 'v',
		});

		expect(state.title).toBe('optional');
		expect(state.code).toBe('required');
		expect(state.section).toBe('required');
		expect(state.publisher).toBe('not-used');
		expect(state.year).toBe('not-used');
		expect(state.supplementDesignation).toBe('not-used');
		expect(state.popularName).toBe('not-used');
	});
});
