import { describe, expect, it } from 'vitest';
import { assert, integer, property } from 'fast-check';
import { parseBaseFontPx } from './font-size';

describe('parseBaseFontPx', () => {
	it('scales the rem token by the root font size', () => {
		expect(parseBaseFontPx('16px', ' 1rem ')).toBe(16);
		expect(parseBaseFontPx('32px', '1rem')).toBe(32);
		expect(parseBaseFontPx('16px', '1.125rem')).toBe(18);
	});

	it('falls back to the root size when the token is not in rem or is missing', () => {
		expect(parseBaseFontPx('20px', '')).toBe(20);
		expect(parseBaseFontPx('20px', '18px')).toBe(20);
		expect(parseBaseFontPx('20px', 'calc(1rem)')).toBe(20);
	});

	it('tracks zoom linearly for any rem token', () => {
		assert(
			property(
				integer({ min: 8, max: 64 }),
				integer({ min: 1, max: 40 }),
				(root, tenths) => {
					const rem = tenths / 10;
					expect(parseBaseFontPx(`${root}px`, `${rem}rem`)).toBeCloseTo(
						root * rem,
					);
				},
			),
		);
	});
});
