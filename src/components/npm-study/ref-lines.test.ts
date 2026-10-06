import { describe, expect, it } from 'vitest';
import { assert, double, property } from 'fast-check';
import { PUBLISH_TO_YANK_CHART, YANK_DATA } from './data';
import {
	LOG_DOMAIN_MIN,
	refLineLookupForScale,
	refLinePlotHours,
	thresholdTooltipText,
} from './ref-lines';

const { refLines } = PUBLISH_TO_YANK_CHART;

describe('refLinePlotHours', () => {
	it('pins the 0h line to the log axis minimum, which has a real data point', () => {
		const plotted = refLinePlotHours(0, 'logarithmic');

		expect(plotted).toBe(LOG_DOMAIN_MIN);
		expect(YANK_DATA.some((d) => d.hours === plotted)).toBe(true);
	});

	it('leaves hours alone on the linear axis', () => {
		expect(refLinePlotHours(0, 'linear')).toBe(0);
	});

	it('never plots left of the log domain, and never moves right of the raw hour by more than the clamp', () => {
		assert(
			property(double({ min: 0, max: 1000, noNaN: true }), (hours) => {
				const plotted = refLinePlotHours(hours, 'logarithmic');
				expect(plotted).toBeGreaterThanOrEqual(LOG_DOMAIN_MIN);
				expect(plotted).toBe(Math.max(hours, LOG_DOMAIN_MIN));
			}),
		);
	});
});

describe('refLineLookupForScale', () => {
	it('keys each ref line by its plotted x and keeps its original index', () => {
		const lookup = refLineLookupForScale(refLines, 'logarithmic');

		expect([...lookup.keys()]).toEqual([1, 24, 72]);
		expect(lookup.get(1)).toEqual({ refLine: refLines[0], index: 0 });
		expect(lookup.get(72)?.index).toBe(2);
	});

	it('keys the 0h line at x=0 on the linear axis', () => {
		expect([...refLineLookupForScale(refLines, 'linear').keys()]).toEqual([
			0, 24, 72,
		]);
	});
});

describe('thresholdTooltipText', () => {
	const point = { hours: 24, percentRemoved: 52.8, count: 7724 };
	const base = { point, tooltipVerb: 'removed by', total: 14629 };

	it('describes a plain point with its formatted hour', () => {
		expect(thresholdTooltipText(base)).toBe(
			'removed by < 24h: 52.8% (7,724 of 14,629)',
		);
	});

	it('switches to whole days from 72h', () => {
		expect(
			thresholdTooltipText({ ...base, point: { ...point, hours: 72 } }),
		).toContain('< 3d:');
	});

	it('merges the ref line label in place of the hour when one coincides', () => {
		expect(
			thresholdTooltipText({
				...base,
				refLine: { hours: 24, label: 'pnpm 11 default' },
			}),
		).toBe('pnpm 11 default (24h) — removed by 52.8% (7,724 of 14,629)');
	});
});
