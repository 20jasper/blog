import { describe, expect, it } from 'vitest';
import { isAvailability } from './availability';

// r[verify unreported.availability]
describe('isAvailability', () => {
	it.each(['database', 'slip'])('%s is a valid availability', (value) => {
		expect(isAvailability(value)).toBe(true);
	});

	it('rejects an arbitrary string', () => {
		expect(isAvailability('electronic')).toBe(false);
	});
});
