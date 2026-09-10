// r[impl statute.material-location]
export const MATERIAL_LOCATIONS = [
	{ value: 'main', text: 'Main volume' },
	{ value: 'both', text: 'Both' },
	{ value: 'supplement', text: 'Supplement only' },
] as const;

export type MaterialLocation = (typeof MATERIAL_LOCATIONS)[number]['value'];

export function isMaterialLocation(value: string): value is MaterialLocation {
	return MATERIAL_LOCATIONS.some((location) => location.value === value);
}
