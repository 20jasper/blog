import { linearRegressionRowsY } from '@tanstack/charts/regression';
import type { MonthlyVolumePoint } from './data';
import type { MonthlyConfig, MonthlyPoint } from './chart-config';

export type MonthlyChartData = Omit<MonthlyConfig, 'title' | 'height'>;

// Every 4th month label -- all of them would overlap at this width.
const TICK_MONTH_STRIDE = 4;

// Pure data prep, run at build time in the component's frontmatter -- no DOM.
export function buildMonthlyChartData(
	rows: MonthlyVolumePoint[],
): MonthlyChartData {
	// `combined` is this chart's own rendering choice (a summed line), not a
	// fact about the data -- rows only carries organic/backfill/tea.xyz apart.
	const points = rows.map((d) => ({
		m: d.m,
		other: d.other,
		backfill: d.backfill,
		combined: d.other + d.backfill,
	}));

	// A straight line only needs its two endpoints, so `samples: 2` gets
	// exactly that instead of a 64-point curve to trim down. Fit against
	// organic activity alone (not the combined line plotted), so the one-off
	// backfill spike doesn't distort the growth trend.
	const trendRows = linearRegressionRowsY(
		points.map((d, i) => ({ i, other: d.other })),
		{ x: 'i', y: 'other', ci: 0, samples: 2 },
	);
	const trend = trendRows.map((row) => ({
		m: points[Math.round(row.x)]!.m,
		trend: row.y,
	}));

	const months = points.map((d) => d.m);
	// Rounded up to the next power of 10 -- a log axis reads best with
	// power-of-10 gridlines.
	const niceMax =
		10 ** Math.ceil(Math.log10(Math.max(...points.map((d) => d.combined))));

	return {
		points,
		trend,
		months,
		tickMonths: months.filter((_, i) => i % TICK_MONTH_STRIDE === 0),
		niceMax,
		// [1, 10, ..., niceMax] -- explicit power-of-10 ticks for the log axis.
		yTicks: Array.from({ length: Math.log10(niceMax) + 1 }, (_, i) => 10 ** i),
		total: points.reduce((sum, d) => sum + d.combined, 0),
	};
}

export function monthlyTooltipText(d: MonthlyPoint) {
	const suffix =
		d.backfill > 0
			? ` (${d.other.toLocaleString()} organic + ${d.backfill.toLocaleString()} backfill)`
			: '';
	return `${d.m}: ${d.combined.toLocaleString()}${suffix}`;
}
