export const MATERIAL_LOCATION_VALUES = ['main', 'both', 'supplement'] as const;

export type MaterialLocation = (typeof MATERIAL_LOCATION_VALUES)[number];

const MATERIAL_LOCATION_TEXT: Record<MaterialLocation, string> = {
	main: 'Main volume',
	both: 'Both',
	supplement: 'Supplement only',
};

// r[impl statute.material-location]
export const MATERIAL_LOCATIONS = MATERIAL_LOCATION_VALUES.map((value) => ({
	value,
	text: MATERIAL_LOCATION_TEXT[value],
}));

export function isMaterialLocation(value: string): value is MaterialLocation {
	return MATERIAL_LOCATIONS.some((location) => location.value === value);
}
