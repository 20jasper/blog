import { describe, expect, it } from 'vitest';
import { initialCitationFields } from './citation-fields';
import { isCitationComplete, missingFields } from './citation-validity';
import { initialDisplayState } from './display-state';

const FULL_REPORTED = {
	...initialCitationFields(),
	party1: 'Dayton',
	party2: 'Stewart',
	volume: '179',
	reporter: 'N.E.3d',
	firstPage: '208',
	year: '2021',
};

describe('missingFields', () => {
	it('lists every required field that is empty', () => {
		expect(
			missingFields(initialCitationFields(), initialDisplayState()),
		).toEqual(['party1', 'party2', 'volume', 'reporter', 'firstPage', 'year']);
	});

	it('is empty once the required fields are filled', () => {
		expect(missingFields(FULL_REPORTED, initialDisplayState())).toEqual([]);
	});

	it('ignores fields the chosen form does not use', () => {
		const display = {
			...initialDisplayState(),
			mode: 'short',
			useId: true,
		} as const;

		expect(missingFields(initialCitationFields(), display)).toEqual([
			'pincite',
		]);
	});
});

describe('isCitationComplete', () => {
	it('is true when nothing required is missing', () => {
		expect(isCitationComplete(FULL_REPORTED, initialDisplayState())).toBe(true);
	});

	it('is false when a required field is missing', () => {
		expect(
			isCitationComplete({ ...FULL_REPORTED, year: '' }, initialDisplayState()),
		).toBe(false);
	});

	it('is false when a numeric field is not digits', () => {
		expect(
			isCitationComplete(
				{ ...FULL_REPORTED, year: '20x1' },
				initialDisplayState(),
			),
		).toBe(false);
	});

	it('accepts an empty optional numeric field', () => {
		expect(
			isCitationComplete({ ...FULL_REPORTED, day: '' }, initialDisplayState()),
		).toBe(true);
	});

	it('rejects a filled optional numeric field that is not digits', () => {
		expect(
			isCitationComplete(
				{ ...FULL_REPORTED, day: 'x' },
				{
					...initialDisplayState(),
					sourceType: 'unreported',
				},
			),
		).toBe(false);
	});
});
