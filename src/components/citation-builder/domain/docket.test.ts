import { describe, expect, it } from 'vitest';
import { array, assert, integer, property } from 'fast-check';
import { normalizeDocket } from './docket';

// r[verify normalize.docket]
describe('normalizeDocket', () => {
	it.each([
		['05-1234', 'No. 05-1234'],
		['No. 05-1234', 'No. 05-1234'],
		['No.05-1234', 'No. 05-1234'],
		['Case No. 21-56789', 'Case No. 21-56789'],
		['Docket No. 21-56789', 'Docket No. 21-56789'],
		['Civ. A. No. 1234', 'Civ. A. No. 1234'],
		['North-123', 'No. North-123'],
		['Norfolk County 44', 'No. Norfolk County 44'],
	])('%s -> %s', (raw, expected) => {
		expect(normalizeDocket(raw)).toBe(expected);
	});

	it('is idempotent for any digit-only docket number', () => {
		assert(
			property(
				array(integer({ min: 0, max: 9 }), {
					minLength: 1,
					maxLength: 8,
				}).map((digits) => digits.join('')),
				(digits) => {
					const once = normalizeDocket(digits);
					expect(normalizeDocket(once)).toBe(once);
				},
			),
		);
	});
});
