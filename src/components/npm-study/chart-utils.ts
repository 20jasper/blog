// Shared across every chart component -- the DOM measurement and
// focus-handling mechanics are identical regardless of what the chart plots,
// only the mark/scale config differs per component.

// Passed directly into each chart's `tickLabels.fontSize`/`axis.label.fontSize`
// so painting and the library's internal margin math read the same number.
//
// `--text-base` is Tailwind's own token. Resolved by hand instead of a DOM
// round-trip: `getPropertyValue` returns the token's raw authored string
// ("1rem", "16px", ...), not a computed px value the way real CSS
// properties do -- rem is the only unit Tailwind's type scale ever authors
// it in, so parse the number out and scale it by the root element's own
// computed font-size (which already reflects the browser/user's real zoom
// and font-size preferences). If `--text-base` is ever redefined in a unit
// other than rem, this needs a second branch to match.
function resolveBaseFontPx() {
	// parseFloat, not Number() -- both getComputedStyle().fontSize ("16px")
	// and the --text-base token ("1rem") carry a trailing unit, which Number()
	// would reject outright (NaN) instead of reading the leading digits.
	// oxlint-disable-next-line prefer-number-coercion
	const rootPx = parseFloat(
		getComputedStyle(document.documentElement).fontSize,
	);
	const token = getComputedStyle(document.documentElement)
		.getPropertyValue('--text-base')
		.trim();
	// oxlint-disable-next-line prefer-number-coercion
	const rem = parseFloat(token);
	return token.endsWith('rem') && !Number.isNaN(rem) ? rem * rootPx : rootPx;
}
export const BASE_FONT_PX = resolveBaseFontPx();

// Shared y-axis tick formatter for count-based charts (records, detections).
export function formatCount(v: number) {
	return v >= 1000
		? `${(v / 1000).toFixed(1).replace(/\.0$/, '')}k`
		: String(v);
}

// ruleX has no `states` field to opt into paint-on-focus like area/line/dot
// do, so there's nothing to key a "this ref line's own mark is focused"
// class off of. onFocusChange fires for pointer hover *and* keyboard nav
// alike (it's the same underlying focus concept the tooltip reads), so the
// ref-line glow keys off it. (The visible focus dot itself doesn't need any
// app code -- the base library already draws one automatically for any mark
// without a custom `mark.focus` config, toggled via its own internal state;
// see docs/tanstack-charts-feedback.md item 1.) `refLineLookup` must be keyed
// by the same value that will show up as `point.xValue` for the coincident
// real data point (a plotted x, not necessarily a "real" value -- see each
// chart's own lookup-construction comment).
export function createRuleXFocusHandler<K>(
	container: HTMLElement,
	refLineLookup: Map<K, { index: number }>,
) {
	return (point: { xValue?: unknown } | null) => {
		const groups = container.querySelectorAll('.ts-chart__rule-x');
		groups.forEach((g) => g.classList.remove('is-focused'));
		const index = refLineLookup.get(point?.xValue as K)?.index;
		if (index !== undefined) groups[index]?.classList.add('is-focused');
	};
}
