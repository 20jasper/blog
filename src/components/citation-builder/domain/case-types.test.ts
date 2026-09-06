import { describe, expect, it } from 'vitest';
import { assembleCaseName, CASE_TYPES, shortCaseName } from './case-types';

// Example party names below are arbitrary and not themselves under test --
// named here so the tables read as "what varies" rather than more strings.
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

	it.each(CASE_TYPES)(
		'$id record carries an id, label, and template',
		(caseType: (typeof CASE_TYPES)[number]) => {
			expect(typeof caseType.id).toBe('string');
			expect(typeof caseType.label).toBe('string');
			expect(typeof caseType.template).toBe('function');
		},
	);
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
	] as const)(
		// party2 has no field to ignore for these types -- the discriminated
		// union makes that unrepresentable rather than merely unused.
		'assembles %s as "%s Party1"',
		(caseType, label) => {
			expect(assembleCaseName({ caseType, party1: PARTY_1 })).toBe(
				`${label} ${PARTY_1}`,
			);
		},
	);

	it('throws on an unrecognized case type rather than silently falling through', () => {
		expect(() =>
			assembleCaseName({
				// @ts-expect-error -- exercising the runtime guard for an invalid id
				caseType: 'bogus',
				party1: PARTY_1,
				party2: PARTY_2,
			}),
		).toThrow(/bogus/u);
	});
});

// r[verify case-name.short-form]
describe('shortCaseName', () => {
	it('is Party 1 alone for case type v, per Rule 10.2.1', () => {
		expect(
			shortCaseName({ caseType: 'v', party1: PARTY_1, party2: PARTY_2 }),
		).toBe(PARTY_1);
	});

	it.each([
		['in-re', 'In re'],
		['ex-parte', 'Ex parte'],
	] as const)(
		'is the assembled name for %s, per Rule 10.2.1',
		(caseType, label) => {
			expect(shortCaseName({ caseType, party1: PARTY_1 })).toBe(
				`${label} ${PARTY_1}`,
			);
		},
	);
});
