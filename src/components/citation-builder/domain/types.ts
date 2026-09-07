// r[impl segment.representation]
// r[impl segment.emphasis-is-abstract]
export type Segment = {
	text: string;
	emphasized: boolean;
};

export type Emphasis = 'italic' | 'underline';

export type FramingOptions = {
	capitalizeFirst: boolean;
	terminalPeriod: boolean;
};
