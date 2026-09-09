import { describe, expect, it } from 'vitest';
import { isMonth } from './months';

describe('isMonth', () => {
	it('rejects the pre-22nd-edition "Sept." abbreviation', () => {
		expect(isMonth('Sept.')).toBe(false);
	});

	it('rejects an arbitrary non-month string', () => {
		expect(isMonth('Septober')).toBe(false);
	});
});
