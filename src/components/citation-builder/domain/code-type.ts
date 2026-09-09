// r[impl statute.code-type]
export const CODE_TYPES = [
	{ value: 'official', text: 'Official code' },
	{ value: 'annotated', text: 'Annotated / unofficial code' },
] as const;

export type CodeType = (typeof CODE_TYPES)[number]['value'];

export function isCodeType(value: string): value is CodeType {
	return CODE_TYPES.some((codeType) => codeType.value === value);
}
