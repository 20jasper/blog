export type Availability = 'database' | 'slip';

// r[impl unreported.availability]
export function isAvailability(value: string): value is Availability {
	return value === 'database' || value === 'slip';
}
