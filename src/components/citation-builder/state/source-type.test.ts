import { describe, expect, it } from 'vitest';
import { isSourceType } from './source-type';

describe('isSourceType', () => {
	it('rejects a value that is not a real source type', () => {
		expect(isSourceType('regulation')).toBe(false);
	});
});
