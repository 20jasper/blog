// Distinct color + dash pairing per reference line, so several ref lines on
// one chart (and their legend) stay visually distinguishable at a glance --
// dash pattern is the primary signal (works with color vision deficiency or
// in grayscale/print), color is a second, independent cue picked for hue
// separation (orange / blue / gray), not just different tokens. `dash`
// omitted means solid. Cycles if a chart ever has more ref lines than styles.
export const REF_LINE_STYLES: { color: string; dash?: string }[] = [
	{ color: 'var(--color-foreground-secondary)', dash: '16 8' },
	{ color: 'var(--color-chart-tertiary)', dash: '2 5' },
	{ color: 'var(--color-chart-secondary)' },
];
