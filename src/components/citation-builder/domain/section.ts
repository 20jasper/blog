const SECTION_SYMBOL = /^(§§?)\s*/u;

// r[impl normalize.section]
export function normalizeSection(raw: string): string {
	const match = SECTION_SYMBOL.exec(raw);
	if (match === null) {
		return `§ ${raw}`;
	}
	const [, symbol] = match;
	return `${symbol} ${raw.slice(match[0].length)}`;
}
