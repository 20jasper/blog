import { describe, expect, it } from 'vitest';
import { assembleCaseName, CASE_TYPES } from './case-types';

const PARTY_1 = 'Dayton';
const PARTY_2 = 'Stewart';

// r[verify case-type.data]
describe('CASE_TYPES', () => {
	it('is an ordered list of records, not branches', () => {
		expect(CASE_TYPES.map((caseType) => caseType.id)).toEqual([
			'v',
			'in-re',
			'ex-parte',
		]);
	});
});

// r[verify case-name.assembly]
describe('assembleCaseName', () => {
	it('assembles v as "Party1 v. Party2"', () => {
		expect(
			assembleCaseName({ caseType: 'v', party1: PARTY_1, party2: PARTY_2 }),
		).toBe(`${PARTY_1} v. ${PARTY_2}`);
	});

	it.each([
		['in-re', 'In re'],
		['ex-parte', 'Ex parte'],
	] as const)('assembles %s as "%s Party1"', (caseType, label) => {
		expect(assembleCaseName({ caseType, party1: PARTY_1 })).toBe(
			`${label} ${PARTY_1}`,
		);
	});
});
