import { defineChart, lineY } from '@tanstack/charts';
import { decorative } from '@tanstack/charts/mark/decorative';
import { scalePoint } from '@tanstack/charts/scales/point';
import { tooltip } from '@tanstack/charts/tooltip';
import { scaleLog } from 'd3-scale';
import type { MonthlyConfig } from './chart-config';
import { formatCount } from './data';
import { monthlyTooltipText } from './monthly-detections';

// Pure config -> chart definition; `fontPx` comes from the caller (see
// buildThresholdDefinition).
export function buildMonthlyDefinition(config: MonthlyConfig, fontPx: number) {
	return defineChart({
		marks: [
			lineY(config.points, {
				x: 'm',
				y: 'combined',
				stroke: 'var(--ts-chart-1)',
				strokeWidth: 2,
			}),
			// decorative: visual context, not its own focus target -- see the same
			// fix in threshold-definition.ts.
			decorative(
				lineY(config.trend, {
					x: 'm',
					y: 'trend',
					stroke: 'var(--color-chart-tertiary)',
					strokeWidth: 2,
					strokeDasharray: '2 5',
				}),
			),
		],
		scales: {
			x: {
				scale: scalePoint().domain(config.months),
				axis: {
					label: { text: 'month', fontSize: fontPx },
					ticks: { values: config.tickMonths },
					tickLabels: { fontSize: fontPx },
				},
			},
			y: {
				scale: scaleLog().domain([1, config.niceMax]),
				grid: true,
				axis: {
					label: { text: 'detections', fontSize: fontPx },
					ticks: { values: config.yTicks, format: formatCount },
					tickLabels: { fontSize: fontPx },
				},
			},
		},
		tooltip: {
			use: tooltip,
			format: (point) => monthlyTooltipText(point.datum),
		},
	});
}
