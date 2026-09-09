export type MaterialLocation = 'main' | 'both' | 'supplement';

// r[impl statute.material-location]
export function isMaterialLocation(value: string): value is MaterialLocation {
	return value === 'main' || value === 'both' || value === 'supplement';
}
