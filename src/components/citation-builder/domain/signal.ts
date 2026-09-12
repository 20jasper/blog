export const SIGNAL_VALUES = [
	'none',
	'e.g.,',
	'accord',
	'see',
	'see also',
	'cf.',
	'contra',
	'but see',
	'but cf.',
	'see generally',
] as const;

export type Signal = (typeof SIGNAL_VALUES)[number];

const SIGNAL_TEXT: Record<Signal, string> = {
	none: 'No signal',
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

// r[impl signal.options]
export const SIGNALS = SIGNAL_VALUES.map((value) => ({
	value,
	text: SIGNAL_TEXT[value],
}));

export function isSignal(value: string): value is Signal {
	return SIGNAL_VALUES.some((signal) => signal === value);
}

// r[impl signal.typeface]
export function signalText(signal: Signal): string | undefined {
	return signal === 'none' ? undefined : SIGNAL_TEXT[signal];
}
