import { describe, expect, it } from 'vitest';
import { isMaterialLocation } from './material-location';

// r[verify statute.material-location]
describe('isMaterialLocation', () => {
	it.each(['main', 'both', 'supplement'])(
		'%s is a valid material location',
		(value) => {
			expect(isMaterialLocation(value)).toBe(true);
		},
	);

	it('rejects an arbitrary string', () => {
		expect(isMaterialLocation('pocket-part')).toBe(false);
	});
});
