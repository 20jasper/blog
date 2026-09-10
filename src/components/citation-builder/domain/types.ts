export type Segment = {
	text: string;
	emphasized?: boolean;
};

export type Emphasis = 'italic' | 'underline';

export type FramingOptions = {
	capitalizeFirst: boolean;
	terminalPeriod: boolean;
};
