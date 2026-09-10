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

function stripTrailingPunctuation(word: string): {
	core: string;
	trailing: string;
} {
	let end = word.length;
	while (end > 0 && (word[end - 1] === '.' || word[end - 1] === ',')) {
		end--;
	}
	return { core: word.slice(0, end), trailing: word.slice(end) };
}

// r[impl case-name.word-abbreviation]
export function abbreviatePartyName(name: string): string {
	return name
		.split(' ')
		.map((word) => {
			const { core, trailing } = stripTrailingPunctuation(word);
			const abbreviation = byWord.get(core.toLowerCase());
			return abbreviation === undefined ? word : abbreviation + trailing;
		})
		.join(' ');
}
