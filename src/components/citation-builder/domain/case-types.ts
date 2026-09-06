export type CaseTypeId = 'v' | 'in-re' | 'ex-parte';

export type CaseNameInput =
	| { caseType: 'v'; party1: string; party2: string }
	| { caseType: 'in-re'; party1: string }
	| { caseType: 'ex-parte'; party1: string };

type CaseType = {
	id: CaseTypeId;
	label: string;
	template: (party1: string, party2: string) => string;
};

const V: CaseType = {
	id: 'v',
	label: 'v.',
	template: (party1, party2) => `${party1} v. ${party2}`,
};
const IN_RE: CaseType = {
	id: 'in-re',
	label: 'In re',
	template: (party1) => `In re ${party1}`,
};
const EX_PARTE: CaseType = {
	id: 'ex-parte',
	label: 'Ex parte',
	template: (party1) => `Ex parte ${party1}`,
};

// Rule 10.2.1: case-type-specific name assembly lives here as data, not as
// if/else branches duplicated across long-form, short-form, and Id. code
// paths. Adding a case type means adding a record, not touching a builder.
// r[impl case-type.data]
export const CASE_TYPES: CaseType[] = [V, IN_RE, EX_PARTE];

// Total by construction, no runtime "not found" guard needed: CaseTypeId
// is a closed union with no untyped external caller, and this record
// literal covers every member -- checked by the compiler, not a cast.
const CASE_TYPE_BY_ID: Record<CaseTypeId, CaseType> = {
	v: V,
	'in-re': IN_RE,
	'ex-parte': EX_PARTE,
};

// r[impl case-name.assembly]
export function assembleCaseName(input: CaseNameInput): string {
	const party2 = input.caseType === 'v' ? input.party2 : '';
	return CASE_TYPE_BY_ID[input.caseType].template(input.party1, party2);
}

// Short form is always Party 1 alone (or the assembled In re/Ex parte
// name) -- a deliberate simplification, not Rule 10.9(a)(i) itself,
// which keeps whichever party is more distinctive. See phase-1-spec.md
// §3.1/§5.7 for the divergence this causes against a real citation.
// r[impl case-name.short-form]
export function shortCaseName(input: CaseNameInput): string {
	return input.caseType === 'v' ? input.party1 : assembleCaseName(input);
}
