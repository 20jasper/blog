// r[impl signal.options]
export const SIGNALS = [
	{ value: 'none', text: 'No signal' },
	{ value: 'e.g.,', text: 'E.g.,' },
	{ value: 'accord', text: 'Accord' },
	{ value: 'see', text: 'See' },
	{ value: 'see also', text: 'See also' },
	{ value: 'cf.', text: 'Cf.' },
	{ value: 'contra', text: 'Contra' },
	{ value: 'but see', text: 'But see' },
	{ value: 'but cf.', text: 'But cf.' },
	{ value: 'see generally', text: 'See generally' },
] as const;

export type Signal = (typeof SIGNALS)[number]['value'];

export function isSignal(value: string): value is Signal {
	return SIGNALS.some((signal) => signal.value === value);
}

const SIGNAL_TEXT: Record<Exclude<Signal, 'none'>, string> = {
	'e.g.,': 'E.g.,',
	accord: 'Accord',
	see: 'See',
	'see also': 'See also',
	'cf.': 'Cf.',
	contra: 'Contra',
	'but see': 'But see',
	'but cf.': 'But cf.',
	'see generally': 'See generally',
};

// r[impl signal.typeface]
export function signalText(signal: Signal): string | undefined {
	return signal === 'none' ? undefined : SIGNAL_TEXT[signal];
}
