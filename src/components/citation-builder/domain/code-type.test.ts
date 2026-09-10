import { describe, expect, it } from 'vitest';
import { isCodeType } from './code-type';

describe('isCodeType', () => {
	it('rejects a value that is not a real code type', () => {
		expect(isCodeType('unofficial')).toBe(false);
	});
});
