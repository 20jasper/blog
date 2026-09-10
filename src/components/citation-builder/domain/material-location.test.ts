import { describe, expect, it } from 'vitest';
import { isMaterialLocation } from './material-location';

describe('isMaterialLocation', () => {
	it('rejects a value that is not a real material location', () => {
		expect(isMaterialLocation('pocket-part')).toBe(false);
	});
});
