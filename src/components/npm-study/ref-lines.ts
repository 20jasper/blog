import { formatThresholdHours } from './data';
import type { ThresholdPoint } from './data';

export type RefLine = { hours: number; label: string };
export type ScaleType = 'logarithmic' | 'linear';

export function isScaleType(value: unknown): value is ScaleType {
	return value === 'logarithmic' || value === 'linear';
}

// The log x domain's real left edge -- independent of which tick labels are
// shown, so it lives with the ref-line math that clamps to it.
export const LOG_DOMAIN_MIN = 1;

// A ref line's own ruleX point never wins nearest-point resolution against
// the real line data at the same x, so the tooltip text instead keys off the
// fact that a line point's *plotted* x coincides with a ref line's plotted x.
// Keyed by plotted position, not the ref line's raw hour: the 0h line has no
// real 0h data point, so it's pinned to the log axis's domain minimum (1h),
// which does coincide with the real 1h point.
export function refLinePlotHours(hours: number, scaleType: ScaleType) {
	return scaleType === 'logarithmic' ? Math.max(hours, LOG_DOMAIN_MIN) : hours;
}

// Keyed by plotted x, which depends on scaleType (0h plots at x=1 on the log
// axis but x=0 on the linear axis) -- rebuilt per scale, not shared.
export function refLineLookupForScale(
	refLines: RefLine[],
	scaleType: ScaleType,
) {
	return new Map(
		refLines.map((refLine, index) => [
			refLinePlotHours(refLine.hours, scaleType),
			{ refLine, index },
		]),
	);
}

export type RefLineLookup = ReturnType<typeof refLineLookupForScale>;

// Renders as plain textContent, not innerHTML -- no entities or tags.
export function thresholdTooltipText({
	point,
	refLine,
	tooltipVerb,
	total,
}: {
	point: ThresholdPoint;
	refLine?: RefLine;
	tooltipVerb: string;
	total: number;
}) {
	const tail = `${point.percentRemoved}% (${point.count.toLocaleString()} of ${total.toLocaleString()})`;
	if (refLine) {
		// refLine.label already reads as "X default" -- the hour is already
		// stated once, no need twice.
		return `${refLine.label} (${refLine.hours}h) — ${tooltipVerb} ${tail}`;
	}
	return `${tooltipVerb} < ${formatThresholdHours(point.hours)}: ${tail}`;
}
