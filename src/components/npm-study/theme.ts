// getComputedStyle() only normalizes *real* CSS properties to rgb(...) --
// a custom property's value comes back exactly as authored (e.g. a literal
// "#cc7a00"), which broke the regex-based color math below. Round-tripping
// through an element's `style.color` setter normalizes any valid CSS color
// (hex, rgb, named, ...) to rgb(...), so downstream code can always assume
// that format.
function normalizeColor(value: string) {
	const el = document.createElement('div');
	el.style.color = value;
	return el.style.color || value;
}

// Reads design tokens from CSS custom properties, defined in global.css.
function cssVar(name: string) {
	const raw = getComputedStyle(document.documentElement)
		.getPropertyValue(name)
		.trim();
	return normalizeColor(raw);
}

export function colors() {
	return {
		primary: cssVar('--color-chart-primary'),
		secondary: cssVar('--color-chart-secondary'),
	};
}

// Distinct color + dash pairing per reference line, so several ref lines on
// one chart (and their legend) stay visually distinguishable at a glance --
// dash pattern is the primary signal (works with color vision deficiency or
// in grayscale/print), color is a second, independent cue picked for hue
// separation (orange / blue / gray), not just different tokens. `dash`
// omitted means solid. Cycles if a chart ever has more ref lines than styles.
export const REF_LINE_STYLES: { color: string; dash?: string }[] = [
	{ color: 'var(--color-chart-secondary)' },
	{ color: 'var(--color-chart-tertiary)', dash: '2 5' },
	{ color: 'var(--color-foreground-secondary)', dash: '16 8' },
];

export function ink() {
	return cssVar('--color-foreground');
}

export function inkMuted() {
	return withAlpha(cssVar('--color-foreground-secondary'), 0.9);
}

export function gridColor() {
	return withAlpha(cssVar('--color-foreground-secondary'), 0.18);
}

export function surface() {
	return cssVar('--color-background');
}

// Tailwind's own type-scale tokens (--text-sm, --text-base, ...), not a
// hardcoded px value -- reads directly, no color-normalization needed.
export function fontSize(token: string) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(`--text-${token}`)
		.trim();
}

// cssVar() returns "rgb(r, g, b)" -- splice in an alpha channel.
function withAlpha(rgb: string, alpha: number) {
	const nums = rgb.match(/[\d.]+/gu);
	if (!nums) return rgb;
	return `rgba(${nums[0]}, ${nums[1]}, ${nums[2]}, ${alpha})`;
}

// WCAG relative luminance, for picking a text color that actually contrasts.
function relativeLuminance(rgb: string) {
	const nums = rgb.match(/[\d.]+/gu);
	if (!nums) return 0;
	const [r, g, b] = [nums[0], nums[1], nums[2]].map((n) => {
		const c = Number(n) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrastRatio(l1: number, l2: number) {
	return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// Mixes an accent color toward black, for label pills: a saturated accent
// with light text on top of it (e.g. black-on-orange) computes a passing
// ratio but still reads poorly -- darkening the pill first keeps the pill
// visually tied to the accent while making light text the clear, comfortable
// choice instead of a coin flip against dark text.
export function darken(rgb: string, amount: number) {
	const nums = rgb.match(/[\d.]+/gu);
	if (!nums) return rgb;
	const [r, g, b] = nums.map((n) => Math.round(Number(n) * (1 - amount)));
	return `rgb(${r}, ${g}, ${b})`;
}

// Picks whichever of ink()/surface() contrasts more against a given background,
// so labels drawn on data-driven colors (e.g. plot-line pills) stay readable.
export function contrastText(backgroundColor: string) {
	const bgL = relativeLuminance(backgroundColor);
	const inkContrast = contrastRatio(bgL, relativeLuminance(ink()));
	const surfaceContrast = contrastRatio(bgL, relativeLuminance(surface()));
	return inkContrast >= surfaceContrast ? ink() : surface();
}
