export const SOURCE_TYPES = [
	{ value: 'reported', text: 'Reported case' },
	{ value: 'unreported', text: 'Unreported case' },
	{ value: 'statute', text: 'Statute' },
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number]['value'];

export function isSourceType(value: string): value is SourceType {
	return SOURCE_TYPES.some((sourceType) => sourceType.value === value);
}
