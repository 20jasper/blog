// r[impl statute.code-type]
export type CodeType = 'official' | 'annotated';

export function isCodeType(value: string): value is CodeType {
	return value === 'official' || value === 'annotated';
}
