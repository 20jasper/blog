import rawAbbreviations from '@vendor/reporters-db/reporters_db/data/case_name_abbreviations.json' with { type: 'json' };

const abbreviations: Record<string, string[]> = rawAbbreviations;

const byWord = new Map<string, string>();
for (const [abbreviation, words] of Object.entries(abbreviations)) {
	for (const word of words) {
		const key = word.toLowerCase();
		if (!byWord.has(key)) {
			byWord.set(key, abbreviation);
		}
	}
}

function splitTrailingPunctuation(word: string): {
	core: string;
	trailing: string;
} {
	let end = word.length;
	while (end > 0 && (word[end - 1] === '.' || word[end - 1] === ',')) {
		end--;
	}
	return { core: word.slice(0, end), trailing: word.slice(end) };
}

function singularCandidates(word: string): string[] {
	const lower = word.toLowerCase();
	const candidates: string[] = [];
	if (lower.endsWith('ies') && lower.length > 3) {
		candidates.push(`${lower.slice(0, -3)}y`);
	}
	if (lower.endsWith('s') && lower.length > 1) {
		candidates.push(lower.slice(0, -1));
	}
	return candidates;
}

// r[impl case-name.plural-abbreviation]
function pluralizeAbbreviation(abbreviation: string): string {
	return abbreviation.endsWith('.')
		? `${abbreviation.slice(0, -1)}s.`
		: `${abbreviation}s`;
}

function abbreviateWord(core: string): string | undefined {
	const direct = byWord.get(core.toLowerCase());
	if (direct !== undefined) {
		return direct;
	}
	for (const candidate of singularCandidates(core)) {
		const singularAbbreviation = byWord.get(candidate);
		if (singularAbbreviation !== undefined) {
			return pluralizeAbbreviation(singularAbbreviation);
		}
	}
	return undefined;
}

// r[impl case-name.word-abbreviation]
export function abbreviatePartyName(name: string): string {
	return name
		.split(' ')
		.map((word) => {
			const { core, trailing } = splitTrailingPunctuation(word);
			const abbreviation = abbreviateWord(core);
			return abbreviation === undefined ? word : abbreviation + trailing;
		})
		.join(' ');
}
