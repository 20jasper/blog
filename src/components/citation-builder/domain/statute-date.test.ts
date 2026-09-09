import { describe, expect, it } from 'vitest';
import { assembleStatuteDate } from './statute-date';

// r[verify statute.material-location]
// r[verify statute.supplement-pairing]
describe('assembleStatuteDate', () => {
	it('matches the domain-spec.md 17 U.S.C. § 107 worked examples', () => {
		expect(assembleStatuteDate({ materialLocation: 'main', year: 2012 })).toBe(
			'2012',
		);

		expect(
			assembleStatuteDate({
				materialLocation: 'supplement',
				supplementDesignation: 'Supp. I',
				supplementYear: 2014,
			}),
		).toBe('Supp. I 2014');

		expect(
			assembleStatuteDate({
				materialLocation: 'both',
				year: 2012,
				supplementDesignation: 'Supp. I',
				supplementYear: 2014,
			}),
		).toBe('2012 & Supp. I 2014');
	});
});
