import rawAbbreviations from './party-name-abbreviations.generated.json' with { type: 'json' };

const PARTY_NAME_ABBREVIATIONS: Record<string, string> = rawAbbreviations;

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

// r[impl case-name.word-abbreviation]
export function abbreviatePartyName(name: string): string {
	return name
		.split(' ')
		.map((word) => {
			const { core, trailing } = splitTrailingPunctuation(word);
			const abbreviation = PARTY_NAME_ABBREVIATIONS[core.toLowerCase()];
			return abbreviation === undefined ? word : abbreviation + trailing;
		})
		.join(' ');
}
