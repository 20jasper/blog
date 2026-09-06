export type CaseTypeId = 'v' | 'in-re' | 'ex-parte';

// party2 only exists for case type "v" -- a discriminated union makes that
// unrepresentable for in-re/ex-parte instead of relying on callers to pass
// (and ignore) a meaningless value.
export type CaseNameInput =
	| { caseType: 'v'; party1: string; party2: string }
	| { caseType: 'in-re'; party1: string }
	| { caseType: 'ex-parte'; party1: string };

type CaseType = {
	id: CaseTypeId;
	label: string;
	template: (party1: string, party2: string) => string;
};

// Rule 10.2.1: case-type-specific name assembly lives here as data, not as
// if/else branches duplicated across long-form, short-form, and Id. code
// paths. Adding a case type means adding a record, not touching a builder.
// r[impl case-type.data]
export const CASE_TYPES: CaseType[] = [
	{
		id: 'v',
		label: 'v.',
		template: (party1, party2) => `${party1} v. ${party2}`,
	},
	{
		id: 'in-re',
		label: 'In re',
		template: (party1) => `In re ${party1}`,
	},
	{
		id: 'ex-parte',
		label: 'Ex parte',
		template: (party1) => `Ex parte ${party1}`,
	},
];

function findCaseType(id: CaseTypeId): CaseType {
	const caseType = CASE_TYPES.find((candidate) => candidate.id === id);
	if (caseType === undefined) {
		throw new Error(`Unrecognized case type: ${id}`);
	}
	return caseType;
}

// r[impl case-name.assembly]
export function assembleCaseName(input: CaseNameInput): string {
	const party2 = input.caseType === 'v' ? input.party2 : '';
	return findCaseType(input.caseType).template(input.party1, party2);
}

// Rule 10.2.1: short form is always Party 1 alone (or the assembled In
// re/Ex parte name, which is already just Party 1 with a label) -- no
// "short name override" field exists by design.
// r[impl case-name.short-form]
export function shortCaseName(input: CaseNameInput): string {
	return input.caseType === 'v' ? input.party1 : assembleCaseName(input);
}
