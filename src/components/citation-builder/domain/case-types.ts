export type CaseTypeId = 'v' | 'in-re' | 'ex-parte';

export type CaseNameInput =
	| { caseType: 'v'; party1: string; party2: string }
	| { caseType: 'in-re'; party1: string }
	| { caseType: 'ex-parte'; party1: string };

type CaseType = {
	id: CaseTypeId;
	label: string;
	template: (party1: string, party2?: string) => string;
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

export const CASE_TYPES: CaseType[] = [V, IN_RE, EX_PARTE];

const CASE_TYPE_BY_ID: Record<CaseTypeId, CaseType> = {
	v: V,
	'in-re': IN_RE,
	'ex-parte': EX_PARTE,
};

export function isCaseTypeId(value: string): value is CaseTypeId {
	return CASE_TYPES.some((caseType) => caseType.id === value);
}

// r[impl case-name.assembly]
export function assembleCaseName(input: CaseNameInput): string {
	const caseType = CASE_TYPE_BY_ID[input.caseType];
	return input.caseType === 'v'
		? caseType.template(input.party1, input.party2)
		: caseType.template(input.party1);
}
