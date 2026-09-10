import rawReporters from '@vendor/reporters-db/reporters_db/data/reporters.json' with { type: 'json' };

type ReporterEntry = { name: string; editions: Record<string, unknown> };
const reporters: Record<string, ReporterEntry[]> = rawReporters;

const editions = Object.values(reporters).flatMap((entries) =>
	entries.flatMap((entry) =>
		Object.keys(entry.editions).map((value) => ({
			value,
			text: entry.name,
		})),
	),
);

export const REPORTER_ABBREVIATIONS = Array.from(
	new Map(editions.map((edition) => [edition.value, edition])).values(),
).toSorted((a, b) => a.value.localeCompare(b.value));
