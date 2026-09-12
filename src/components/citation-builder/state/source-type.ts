export const SOURCE_TYPE_VALUES = [
	'reported',
	'unreported',
	'statute',
] as const;

export type SourceType = (typeof SOURCE_TYPE_VALUES)[number];

const SOURCE_TYPE_TEXT: Record<SourceType, string> = {
	reported: 'Reported case',
	unreported: 'Unreported case',
	statute: 'Statute',
};

export const SOURCE_TYPES = SOURCE_TYPE_VALUES.map((value) => ({
	value,
	text: SOURCE_TYPE_TEXT[value],
}));

export function isSourceType(value: string): value is SourceType {
	return SOURCE_TYPES.some((sourceType) => sourceType.value === value);
}
