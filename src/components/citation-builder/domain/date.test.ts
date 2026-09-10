import { describe, expect, it } from 'vitest';
import { assembleDate } from './date';

// r[verify normalize.date]
describe('assembleDate', () => {
	it('combines month, day, and year with a comma before the year', () => {
		expect(assembleDate('Oct.', 21, 2005)).toBe('Oct. 21, 2005');
	});

	it('does not pad single-digit days', () => {
		expect(assembleDate('Jan.', 1, 2024)).toBe('Jan. 1, 2024');
	});

	it('handles months with no trailing period', () => {
		expect(assembleDate('June', 17, 2021)).toBe('June 17, 2021');
	});
});
