import type { Axis, Options } from 'highcharts';
import {
	ink,
	inkMuted,
	gridColor,
	surface,
	contrastText,
	darken,
	fontSize,
} from './theme';

// Shared base config; chart-specific series/axes compose on top per chart.
export function baseOptions(): Options {
	return {
		chart: {
			backgroundColor: 'transparent',
			animation: false,
		},
		credits: { enabled: false },
		title: { text: undefined },
		plotOptions: {
			series: {
				animation: false,
				// No hover fade/grow -- reads as janky, not smooth.
				states: {
					hover: { animation: false },
					inactive: { opacity: 1 },
				},
				marker: {
					enabled: false,
					// No white marker outline.
					lineColor: undefined,
					states: {
						hover: { animation: false, lineWidth: 0 },
					},
				},
				// No white column/bar outline.
				borderWidth: 0,
			},
		},
		tooltip: {
			backgroundColor: ink(),
			style: { color: surface() },
			animation: false,
		},
	};
}

export function axisLabelStyle() {
	return { style: { color: inkMuted(), fontSize: fontSize('sm') } };
}

// Extra breathing room between the axis title and its tick labels, and full
// ink color instead of the muted tick-label color -- an axis title reads as
// a caption, not chrome.
export function axisTitleStyle(text: string) {
	return {
		text,
		style: { color: ink(), fontSize: fontSize('sm') },
		margin: 12,
	};
}

// Highcharts defaults a y-axis title to a -90deg rotation, which is hard to
// read regardless of color or size -- force horizontal, aligned above the
// tick labels (not centered beside them, where it'd overlap).
export function yAxisTitleStyle(text: string) {
	return {
		...axisTitleStyle(text),
		rotation: 0,
		align: 'high' as const,
		textAlign: 'left' as const,
		y: -8,
	};
}

export function axisLineStyle() {
	return {
		gridLineColor: gridColor(),
		lineColor: gridColor(),
		tickColor: gridColor(),
	};
}

// Must be a tickPositioner, not a static tickPositions array: on a log
// axis, min/max are stored log-transformed, and a plain array gets compared
// against that unconverted, silently dropping most ticks. val2lin() converts
// each value into whatever space the axis actually compares against.
export function thresholdTickPositioner(scaleType: 'logarithmic' | 'linear') {
	const hours =
		scaleType === 'logarithmic'
			? [1, 6, 24, 72, 168, 336, 720]
			: [72, 168, 336, 720];
	return function (this: Axis) {
		// val2lin is added at runtime by Highcharts' LogarithmicAxis
		// composition; it isn't in the Axis type, so this cast is necessary.
		// oxlint-disable-next-line no-unsafe-type-assertion
		const axis = this as unknown as { val2lin?: (value: number) => number };
		return hours.map((h) => (axis.val2lin ? axis.val2lin(h) : h));
	};
}

export function thresholdLabelFormatter(data: { h: number; label: string }[]) {
	return function (this: { value: number | string }) {
		const point = data.find((d) => d.h === Number(this.value));
		return point ? point.label : '';
	};
}

// Thin dashes read as too faint.
export const DASH_LINE_WIDTH = 3;

// Solid pill + light text so plot-line labels stay legible over gridlines.
// The pill is darkened first: light-on-saturated-accent reads poorly even
// when it technically passes contrast, so darkening makes light text the
// clear winner instead of a near-tie against dark text.
export function plotLineLabel(text: string, accentColor: string) {
	const backgroundColor = darken(accentColor, 0.45);
	return {
		text,
		useHTML: true,
		// Highcharts defaults to vertical; force horizontal.
		rotation: 0,
		style: {
			color: contrastText(backgroundColor),
			backgroundColor,
			padding: '2px 6px',
			borderRadius: '3px',
			fontSize: fontSize('base'),
			fontWeight: '600',
			whiteSpace: 'nowrap',
		},
	};
}
