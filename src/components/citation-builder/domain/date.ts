import type { Month } from './months';

// r[impl normalize.date]
export function assembleDate(month: Month, day: number, year: number): string {
	return `${month} ${day}, ${year}`;
}
