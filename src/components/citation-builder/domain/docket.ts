const DOCKET_PREFIX = /^(?<prefix>(?:[a-z]+\.?\s+)*no)\.?(?=\s|$|\d)\s*/iu;

// r[impl normalize.docket]
export function normalizeDocket(raw: string): string {
	const match = DOCKET_PREFIX.exec(raw);
	if (match?.groups === undefined) {
		return `No. ${raw}`;
	}
	const rest = raw.slice(match[0].length);
	return `${match.groups.prefix}. ${rest}`;
}
