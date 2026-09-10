import rawLaws from '@vendor/reporters-db/reporters_db/data/laws.json' with { type: 'json' };

type LawEntry = { name: string };
const laws: Record<string, LawEntry[]> = rawLaws;

export const CODE_ABBREVIATIONS = Object.entries(laws)
	.map(([value, entries]) => ({ value, text: entries[0]!.name }))
	.toSorted((a, b) => a.value.localeCompare(b.value));
