// r[impl unreported.availability]
export const AVAILABILITIES = [
	{ value: 'database', text: 'In electronic database' },
	{ value: 'slip', text: 'Slip opinion only' },
] as const;

export type Availability = (typeof AVAILABILITIES)[number]['value'];

export function isAvailability(value: string): value is Availability {
	return AVAILABILITIES.some((availability) => availability.value === value);
}
