export type Mode = 'full' | 'short';
export type NameVariant = 'full' | 'party1' | 'party2' | 'none';
export type Emphasis = 'italic' | 'underline';
export type SpanSeparator = '-' | '–';

export type DisplayState = {
	mode: Mode;
	nameVariant: NameVariant;
	useId: boolean;
	emphasis: Emphasis;
	spanSeparator: SpanSeparator;
};

export function initialDisplayState(): DisplayState {
	return {
		mode: 'full',
		nameVariant: 'full',
		useId: false,
		emphasis: 'italic',
		spanSeparator: '-',
	};
}
