import { describe, expect, it } from 'vitest';
import { array, assert, integer, property } from 'fast-check';
import { normalizeSection } from './section';

// r[verify normalize.section]
describe('normalizeSection', () => {
	it.each([
		['1350', '§ 1350'],
		['§1350', '§ 1350'],
		['§ 1350', '§ 1350'],
		['§§1350-51', '§§ 1350-51'],
		['§§ 1350-51', '§§ 1350-51'],
	])('%s -> %s', (raw, expected) => {
		expect(normalizeSection(raw)).toBe(expected);
	});

	it('is idempotent for any digit-only section number', () => {
		assert(
			property(
				array(integer({ min: 0, max: 9 }), {
					minLength: 1,
					maxLength: 8,
				}).map((digits) => digits.join('')),
				(digits) => {
					const once = normalizeSection(digits);
					expect(normalizeSection(once)).toBe(once);
				},
			),
		);
	});
});
