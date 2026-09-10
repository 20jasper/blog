import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const SOURCE_URL = 'https://law.resource.org/pub/us/code/blue/IndigoBook.html';
const FREELAW_PATH = new URL(
	'../vendor/reporters-db/reporters_db/data/case_name_abbreviations.json',
	import.meta.url,
);
const OUT_PATH = new URL(
	'../src/components/citation-builder/domain/party-name-abbreviations.generated.json',
	import.meta.url,
);

function straighten(text) {
	return text.replaceAll('’', "'");
}

function splitOptions(bracketContent) {
	return bracketContent.split(',').map((option) => option.trim());
}

function expandRow(rawWord, rawAbbreviation) {
	const word = straighten(rawWord);
	const abbreviation = straighten(rawAbbreviation);

	const wordMatch = /^(?<prefix>[^[]*)\[(?<options>[^\]]*)\]$/u.exec(word);
	if (wordMatch?.groups === undefined) {
		return [[word, abbreviation]];
	}
	const { prefix: wordPrefix, options: wordOptionsRaw } = wordMatch.groups;
	const wordOptions = splitOptions(wordOptionsRaw);

	const abbreviationMatch =
		/^(?<prefix>[^[]*?)\s*\[(?<options>[^\]]*)\]$/u.exec(abbreviation);
	if (abbreviationMatch?.groups === undefined) {
		return wordOptions.map((option) => [
			`${wordPrefix}${option}`,
			abbreviation,
		]);
	}
	const { prefix: abbreviationPrefix, options: abbreviationOptionsRaw } =
		abbreviationMatch.groups;
	const abbreviationOptions = splitOptions(abbreviationOptionsRaw);

	return wordOptions.map((option, index) => [
		`${wordPrefix}${option}`,
		`${abbreviationPrefix}${abbreviationOptions[index]}`,
	]);
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(SOURCE_URL, { waitUntil: 'networkidle', timeout: 60000 });
const rows = await page.$$eval('#T11 ~ table tr', (trs) =>
	trs.map((tr) =>
		Array.from(tr.querySelectorAll('td,th')).map(
			(td) => td.textContent?.trim() ?? '',
		),
	),
);
await browser.close();

const freelawAbbreviations = JSON.parse(await readFile(FREELAW_PATH, 'utf8'));
const entries = new Map();
for (const [abbreviation, words] of Object.entries(freelawAbbreviations)) {
	for (const word of words) {
		if (!word.includes(' ')) {
			entries.set(word.toLowerCase(), abbreviation);
		}
	}
}

const dataRows = rows.slice(1);
for (const [word, abbreviation] of dataRows) {
	for (const [expandedWord, expandedAbbreviation] of expandRow(
		word,
		abbreviation,
	)) {
		entries.set(expandedWord.toLowerCase(), expandedAbbreviation);
	}
}

const output = Object.fromEntries(
	Array.from(entries, ([word, abbreviation]) => {
		const options = abbreviation.split(' or ').map((option) => option.trim());
		return [word, options[0]];
	}),
);

await writeFile(OUT_PATH, `${JSON.stringify(output, null, '\t')}\n`);
console.log(
	`Wrote ${entries.size} party-name abbreviations to ${OUT_PATH.pathname}`,
);
