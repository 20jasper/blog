export type CodeType = 'official' | 'annotated';

// r[impl statute.code-type]
export function isCodeType(value: string): value is CodeType {
	return value === 'official' || value === 'annotated';
}
