const DOCKET_PREFIX = /^(?:case\s+no\.?|docket\s+no\.?|no\.?)(?=\s|$|\d)\s*/iu;

// r[impl normalize.docket]
export function normalizeDocket(raw: string): string {
	return `No. ${raw.replace(DOCKET_PREFIX, '')}`;
}
