export const AVAILABILITY_VALUES = ['database', 'slip', 'online'] as const;

export type Availability = (typeof AVAILABILITY_VALUES)[number];

const AVAILABILITY_TEXT: Record<Availability, string> = {
	database: 'In electronic database',
	slip: 'Slip opinion only',
	online: 'Website only (no database)',
};

// r[impl unreported.availability]
export const AVAILABILITIES = AVAILABILITY_VALUES.map((value) => ({
	value,
	text: AVAILABILITY_TEXT[value],
}));

export function isAvailability(value: string): value is Availability {
	return AVAILABILITIES.some((availability) => availability.value === value);
}
