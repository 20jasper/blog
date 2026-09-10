// r[impl case-history.phrases]
// r[impl case-history.sub-nom]
export const HISTORY_PHRASES = [
	{ value: 'acq.', text: 'acq.' },
	{ value: 'acq. in result', text: 'acq. in result' },
	{ value: 'aff’d,', text: 'aff’d,' },
	{
		value: 'aff’d by an equally divided court,',
		text: 'aff’d by an equally divided court,',
	},
	{ value: 'aff’d mem.,', text: 'aff’d mem.,' },
	{ value: 'aff’d on other grounds,', text: 'aff’d on other grounds,' },
	{ value: 'aff’d on reh’g,', text: 'aff’d on reh’g,' },
	{ value: 'aff’g', text: 'aff’g' },
	{ value: 'amended by', text: 'amended by' },
	{ value: 'appeal denied,', text: 'appeal denied,' },
	{ value: 'appeal dismissed,', text: 'appeal dismissed,' },
	{ value: 'appeal docketed,', text: 'appeal docketed,' },
	{ value: 'appeal filed,', text: 'appeal filed,' },
	{ value: 'argued,', text: 'argued,' },
	{ value: 'cert. denied,', text: 'cert. denied,' },
	{ value: 'cert. dismissed,', text: 'cert. dismissed,' },
	{ value: 'cert. granted,', text: 'cert. granted,' },
	{ value: 'certifying questions to', text: 'certifying questions to' },
	{ value: 'denying cert. to', text: 'denying cert. to' },
	{ value: 'dismissing appeal from', text: 'dismissing appeal from' },
	{ value: 'enforced,', text: 'enforced,' },
	{ value: 'enforcing', text: 'enforcing' },
	{ value: 'invalidated by', text: 'invalidated by' },
	{ value: 'mandamus denied,', text: 'mandamus denied,' },
	{ value: 'modified,', text: 'modified,' },
	{ value: 'modifying', text: 'modifying' },
	{ value: 'nonacq.', text: 'nonacq.' },
	{ value: 'overruled by', text: 'overruled by' },
	{ value: 'perm. app. denied,', text: 'perm. app. denied,' },
	{ value: 'perm. app. granted,', text: 'perm. app. granted,' },
	{ value: 'petition for cert. filed,', text: 'petition for cert. filed,' },
	{ value: 'prob. juris. noted,', text: 'prob. juris. noted,' },
	{
		value: 'reh’g granted [denied],',
		text: 'reh’g granted [denied],',
	},
	{ value: 'rev’d,', text: 'rev’d,' },
	{ value: 'rev’d on other grounds,', text: 'rev’d on other grounds,' },
	{ value: 'rev’d per curiam,', text: 'rev’d per curiam,' },
	{ value: 'rev’g', text: 'rev’g' },
	{ value: 'sub nom.', text: 'sub nom.' },
	{ value: 'vacated,', text: 'vacated,' },
	{ value: 'vacating as moot', text: 'vacating as moot' },
	{ value: 'withdrawn,', text: 'withdrawn,' },
] as const;

export type HistoryPhrase = (typeof HISTORY_PHRASES)[number]['value'];

export function isHistoryPhrase(value: string): value is HistoryPhrase {
	return HISTORY_PHRASES.some((phrase) => phrase.value === value);
}
