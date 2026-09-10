import courts from '@vendor/courts-db/courts_db/data/courts.json' with { type: 'json' };

export const COURT_ABBREVIATIONS = courts
	.filter((court) => court.citation_string !== '')
	.map((court) => ({ value: court.citation_string, text: court.name }))
	.toSorted((a, b) => a.value.localeCompare(b.value));
