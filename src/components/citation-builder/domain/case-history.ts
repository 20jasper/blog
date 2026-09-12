// r[impl case-history.phrases]
// r[impl case-history.sub-nom]
export const HISTORY_PHRASE_VALUES = [
	'acq.',
	'acq. in result',
	'aff’d,',
	'aff’d by an equally divided court,',
	'aff’d mem.,',
	'aff’d on other grounds,',
	'aff’d on reh’g,',
	'aff’g',
	'amended by',
	'appeal denied,',
	'appeal dismissed,',
	'appeal docketed,',
	'appeal filed,',
	'argued,',
	'cert. denied,',
	'cert. dismissed,',
	'cert. granted,',
	'certifying questions to',
	'denying cert. to',
	'dismissing appeal from',
	'enforced,',
	'enforcing',
	'invalidated by',
	'mandamus denied,',
	'modified,',
	'modifying',
	'nonacq.',
	'overruled by',
	'perm. app. denied,',
	'perm. app. granted,',
	'petition for cert. filed,',
	'prob. juris. noted,',
	'reh’g granted [denied],',
	'rev’d,',
	'rev’d on other grounds,',
	'rev’d per curiam,',
	'rev’g',
	'sub nom.',
	'vacated,',
	'vacating as moot',
	'withdrawn,',
] as const;

export type HistoryPhrase = (typeof HISTORY_PHRASE_VALUES)[number];

// text is always identical to value for history phrases
export const HISTORY_PHRASES = HISTORY_PHRASE_VALUES.map((value) => ({
	value,
	text: value,
}));

export function isHistoryPhrase(value: string): value is HistoryPhrase {
	return HISTORY_PHRASE_VALUES.some((phrase) => phrase === value);
}
