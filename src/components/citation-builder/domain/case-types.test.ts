import { describe, expect, it } from 'vitest';
import { assembleCaseName, isCaseTypeId } from './case-types';

const PARTY_1 = 'Dayton';
const PARTY_2 = 'Stewart';

describe('isCaseTypeId', () => {
	it.each(['v', 'in-re', 'ex-parte'])('%s is a valid case type id', (id) => {
		expect(isCaseTypeId(id)).toBe(true);
	});
});

// r[verify case-name.assembly]
describe('assembleCaseName', () => {
	it('assembles v as "Party1 v. Party2"', () => {
		expect(
			assembleCaseName({ caseType: 'v', party1: PARTY_1, party2: PARTY_2 }),
		).toBe('Dayton v. Stewart');
	});

	it.each([
		['in-re', 'In re Dayton'],
		['ex-parte', 'Ex parte Dayton'],
	] as const)('assembles %s as "%s"', (caseType, expected) => {
		expect(assembleCaseName({ caseType, party1: PARTY_1 })).toBe(expected);
	});
});
