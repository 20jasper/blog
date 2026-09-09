import { describe, expect, it } from 'vitest';
import { isNameVariant } from './display-state';

describe('isNameVariant', () => {
	it('rejects a value that is not a real name variant', () => {
		expect(isNameVariant('id')).toBe(false);
	});
});
