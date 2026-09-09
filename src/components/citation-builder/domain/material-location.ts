// r[impl statute.material-location]
export type MaterialLocation = 'main' | 'both' | 'supplement';

export function isMaterialLocation(value: string): value is MaterialLocation {
	return value === 'main' || value === 'both' || value === 'supplement';
}
