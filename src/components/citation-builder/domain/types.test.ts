import { describe, expect, it } from 'vitest';
import { MONTHS } from './types';

describe('MONTHS', () => {
	it('has exactly 12 entries, one per calendar month, no duplicates', () => {
		expect(MONTHS).toHaveLength(12);
		expect(new Set(MONTHS).size).toBe(12);
	});

	it('abbreviates every month except May, June, and July', () => {
		const unabbreviated = MONTHS.filter((month) => !month.endsWith('.'));

		expect(unabbreviated).toEqual(['May', 'June', 'July']);
	});
});
