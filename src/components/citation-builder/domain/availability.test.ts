import { describe, expect, it } from 'vitest';
import { isAvailability } from './availability';

describe('isAvailability', () => {
	it('rejects a value that is not a real availability', () => {
		expect(isAvailability('electronic')).toBe(false);
	});
});
