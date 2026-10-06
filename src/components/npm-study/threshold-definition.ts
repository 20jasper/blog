import { areaY, defineChart, lineY, ruleX } from '@tanstack/charts';
import { whenFocused } from '@tanstack/charts/focus/mark';
import { decorative } from '@tanstack/charts/mark/decorative';
import { scaleLinear } from '@tanstack/charts/scales/linear';
import { tooltip } from '@tanstack/charts/tooltip';
import { scaleLog } from 'd3-scale';
import { formatThresholdHours } from './data';
import type { ThresholdConfig } from './chart-config';
import { refLineLookupForScale, thresholdTooltipText } from './ref-lines';
import type { RefLineLookup, ScaleType } from './ref-lines';
import { REF_LINE_STYLES } from './theme';

export const LOG_HOURS = [2, 6, 24, 72, 168, 336, 720];
export const LINEAR_HOURS = [24, 72, 168, 336, 528, 720];

// Fixed 0-100 range -- consistent axis across charts, room above the curve
// for the ref-line label.
const Y_MAX = 100;
// Pass configured scale *instances*, not a zero-arg factory -- a factory
// still gets its domain re-inferred from the mark data, silently discarding
// the .domain() call. Both scales are invariant across scale-toggle clicks
// and mark rebuilds, so each is built exactly once.
const X_SCALES = {
	logarithmic: scaleLog().domain([1, 720]),
	linear: scaleLinear().domain([0, 720]),
};
const Y_SCALE = scaleLinear().domain([0, Y_MAX]);

// One rule per ref line. whenFocused repaints a thicker copy only while the
// focused point shares its x -- the native replacement for keying a CSS class
// off onFocusChange.
function refLineMarks(lookup: RefLineLookup) {
	return Array.from(lookup, ([plotHours, { index }]) => {
		const style = REF_LINE_STYLES[index % REF_LINE_STYLES.length]!;
		const rule = {
			x: 'x' as const,
			stroke: style.color,
			strokeDasharray: style.dash,
		};
		const row = [{ x: plotHours }];
		return [
			ruleX(row, { ...rule, strokeWidth: 4, strokeOpacity: 0.8 }),
			whenFocused(ruleX(row, { ...rule, strokeWidth: 6, strokeOpacity: 1 }), {
				match: 'x',
			}),
		];
	}).flat();
}

// Pure config -> chart definition: no DOM, so it runs under plain Vitest.
// `fontPx` is passed in (not read from the DOM here) so painting and the
// library's margin math share one number the caller resolved.
export function buildThresholdDefinition(
	config: ThresholdConfig,
	scaleType: ScaleType,
	fontPx: number,
) {
	const { total, tooltipVerb, xColumnLabel, yColumnLabel, data } = config;
	const lookup = refLineLookupForScale(config.refLines, scaleType);
	const tickHours = scaleType === 'logarithmic' ? LOG_HOURS : LINEAR_HOURS;

	return defineChart({
		marks: [
			// decorative: the fill is visual context behind the line, not its own
			// focus target -- without it, area and line each register a focus
			// anchor at every x, so keyboard/pointer nav needs two steps per point.
			decorative(
				areaY(data, {
					x: 'hours',
					y: 'percentRemoved',
					fillOpacity: 0.13,
					fill: 'var(--ts-chart-1)',
				}),
			),
			lineY(data, {
				x: 'hours',
				y: 'percentRemoved',
				stroke: 'var(--ts-chart-1)',
				strokeWidth: 2,
			}),
			...refLineMarks(lookup),
		],
		scales: {
			x: {
				scale: X_SCALES[scaleType],
				axis: {
					label: { text: xColumnLabel, fontSize: fontPx },
					ticks: { values: tickHours, format: formatThresholdHours },
					tickLabels: { fontSize: fontPx },
				},
			},
			y: {
				scale: Y_SCALE,
				grid: true,
				axis: {
					label: { text: yColumnLabel, fontSize: fontPx },
					ticks: { format: (v: number) => `${v}%` },
					tickLabels: { fontSize: fontPx },
				},
			},
		},
		tooltip: {
			use: tooltip,
			format: (point) =>
				thresholdTooltipText({
					point: point.datum,
					refLine: lookup.get(point.xValue)?.refLine,
					tooltipVerb,
					total,
				}),
		},
	});
}
