import { describe, expect, it } from 'vitest';
import { array, assert, integer, property } from 'fast-check';
import { MONTHLY_DETECTIONS_CHART } from './data';
import {
	buildMonthlyChartData,
	monthlyTooltipText,
} from './monthly-detections';
import { buildMonthlyDefinition } from './monthly-definition';

const rows = (others: number[]) =>
	others.map((other, i) => ({
		m: `2024-${String(i + 1).padStart(2, '0')}`,
		tea: 0,
		backfill: 0,
		other,
	}));

describe('buildMonthlyChartData', () => {
	it('plots organic plus backfill as one combined value and leaves tea.xyz out', () => {
		const data = buildMonthlyChartData([
			{ m: '2025-08', tea: 99, backfill: 30, other: 5 },
			{ m: '2025-09', tea: 0, backfill: 0, other: 7 },
		]);

		expect(data.points.map((p) => p.combined)).toEqual([35, 7]);
		expect(data.total).toBe(42);
	});

	it('labels every 4th month', () => {
		const data = buildMonthlyChartData(rows([1, 2, 3, 4, 5, 6, 7, 8, 9]));

		expect(data.tickMonths).toEqual(['2024-01', '2024-05', '2024-09']);
	});

	it('draws the trend between its two endpoint months', () => {
		const data = buildMonthlyChartData(rows([10, 20, 30, 40]));

		expect(data.trend.map((t) => t.m)).toEqual(['2024-01', '2024-04']);
		expect(data.trend[1]!.trend).toBeGreaterThan(data.trend[0]!.trend);
	});

	it('rounds the log axis up to a power of ten with a tick at each decade', () => {
		assert(
			property(
				array(integer({ min: 1, max: 1_000_000 }), {
					minLength: 2,
					maxLength: 40,
				}),
				(others) => {
					const { niceMax, yTicks, points } = buildMonthlyChartData(
						rows(others),
					);
					const max = Math.max(...points.map((p) => p.combined));

					expect(niceMax).toBeGreaterThanOrEqual(max);
					expect(niceMax / 10).toBeLessThan(max);
					expect(yTicks[0]).toBe(1);
					expect(yTicks.at(-1)).toBe(niceMax);
				},
			),
		);
	});

	it('handles the real dataset', () => {
		const data = buildMonthlyChartData(MONTHLY_DETECTIONS_CHART.rows);

		expect(data.months[0]).toBe('2022-05');
		expect(data.niceMax).toBe(100_000);
		expect(data.yTicks).toEqual([1, 10, 100, 1000, 10_000, 100_000]);
	});
});

describe('monthlyTooltipText', () => {
	it('shows only the total when there is no backfill', () => {
		expect(
			monthlyTooltipText({
				m: '2024-01',
				other: 1500,
				backfill: 0,
				combined: 1500,
			}),
		).toBe('2024-01: 1,500');
	});

	it('splits organic from backfill when backfill is present', () => {
		expect(
			monthlyTooltipText({
				m: '2025-08',
				other: 1085,
				backfill: 34119,
				combined: 35204,
			}),
		).toBe('2025-08: 35,204 (1,085 organic + 34,119 backfill)');
	});
});

describe('buildMonthlyDefinition', () => {
	it('passes the resolved font size to every label', () => {
		const config = {
			...buildMonthlyChartData(MONTHLY_DETECTIONS_CHART.rows),
			title: 'x',
			height: 300,
		};
		const { x, y } = buildMonthlyDefinition(config, 19).scales;

		expect(x.axis.label).toMatchObject({ fontSize: 19 });
		expect(y.axis.tickLabels).toMatchObject({ fontSize: 19 });
	});
});
