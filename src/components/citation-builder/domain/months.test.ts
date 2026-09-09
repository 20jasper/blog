import { describe, expect, it } from 'vitest';
import { isMonth, MONTHS } from './months';

// r[verify date.month-list]
describe('isMonth', () => {
	it.each(MONTHS)('%s is a valid month', (month) => {
		expect(isMonth(month)).toBe(true);
	});

	it('has exactly twelve values', () => {
		expect(MONTHS).toHaveLength(12);
	});

	it('rejects the pre-22nd-edition "Sept." abbreviation', () => {
		expect(isMonth('Sept.')).toBe(false);
	});

	it('rejects an arbitrary non-month string', () => {
		expect(isMonth('Septober')).toBe(false);
	});
});
