import { describe, expect, it } from 'vitest';
import { isSourceType } from './source-type';

describe('isSourceType', () => {
	it.each(['reported', 'unreported', 'statute'])(
		'%s is a valid source type',
		(value) => {
			expect(isSourceType(value)).toBe(true);
		},
	);

	it('rejects an arbitrary string', () => {
		expect(isSourceType('regulation')).toBe(false);
	});
});
