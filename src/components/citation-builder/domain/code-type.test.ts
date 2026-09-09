import { describe, expect, it } from 'vitest';
import { isCodeType } from './code-type';

// r[verify statute.code-type]
describe('isCodeType', () => {
	it.each(['official', 'annotated'])('%s is a valid code type', (value) => {
		expect(isCodeType(value)).toBe(true);
	});

	it('rejects an arbitrary string', () => {
		expect(isCodeType('unofficial')).toBe(false);
	});
});
