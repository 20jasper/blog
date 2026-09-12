export const CODE_TYPE_VALUES = ['official', 'annotated'] as const;

export type CodeType = (typeof CODE_TYPE_VALUES)[number];

const CODE_TYPE_TEXT: Record<CodeType, string> = {
	official: 'Official code',
	annotated: 'Annotated / unofficial code',
};

// r[impl statute.code-type]
export const CODE_TYPES = CODE_TYPE_VALUES.map((value) => ({
	value,
	text: CODE_TYPE_TEXT[value],
}));

export function isCodeType(value: string): value is CodeType {
	return CODE_TYPES.some((codeType) => codeType.value === value);
}
