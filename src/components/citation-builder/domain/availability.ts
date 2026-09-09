// r[impl unreported.availability]
export type Availability = 'database' | 'slip';

export function isAvailability(value: string): value is Availability {
	return value === 'database' || value === 'slip';
}
