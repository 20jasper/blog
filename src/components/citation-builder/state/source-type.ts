export type SourceType = 'reported' | 'unreported' | 'statute';

export function isSourceType(value: string): value is SourceType {
	return value === 'reported' || value === 'unreported' || value === 'statute';
}
