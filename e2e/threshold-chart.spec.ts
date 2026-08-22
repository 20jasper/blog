import { expect, test, type Page } from '@playwright/test';
import { YANK_DATA, YANK_N } from '../src/components/npm-study/data';

type ChartPoint = { x: number; plotX: number; plotY: number };
type ChartInstance = {
	// chart.container is Highcharts' own auto-generated wrapper div; the id
	// we pass to Highcharts.chart() lands on chart.renderTo instead.
	renderTo: HTMLElement;
	container: HTMLElement;
	plotLeft: number;
	plotTop: number;
	series: { points: ChartPoint[] }[];
};

// Ask Highcharts for a point's own screen coordinates instead of assuming
// pixel geometry from axis math -- that broke the moment the plot area's
// size changed (bigger axis labels/titles shifted it).
function pointScreenPosition(page: Page, chartId: string, x: number) {
	return page.evaluate(
		([id, xValue]) => {
			// oxlint-disable-next-line no-unsafe-type-assertion
			const win = globalThis as unknown as {
				Highcharts: { charts: (ChartInstance | null)[] };
			};
			const chart = win.Highcharts.charts.find((c) => c?.renderTo.id === id);
			if (!chart) throw new Error(`${id} instance not found`);
			const point = chart.series[0]!.points.find((p) => p.x === xValue);
			if (!point) throw new Error(`point x=${xValue} not found`);
			const rect = chart.renderTo.getBoundingClientRect();
			return {
				x: rect.left + chart.plotLeft + point.plotX,
				y: rect.top + chart.plotTop + point.plotY,
			};
		},
		[chartId, x] as const,
	);
}

async function assertTooltipMatches(page: Page) {
	const point24h = YANK_DATA.find((d) => d.h === 24);
	if (!point24h) throw new Error('fixture data missing the 24h point');

	const target = await pointScreenPosition(page, 'chart-yank', 24);
	// Highcharts needs a real pointer path into the plot area, not a single
	// teleporting move, to register the hover and show a tooltip.
	await page.mouse.move(0, 0);
	await page.mouse.move(target.x, target.y, { steps: 10 });

	const tooltip = page.locator('.highcharts-tooltip');
	await expect(tooltip).toContainText(`${point24h.pct}%`);
	await expect(tooltip).toContainText(point24h.n.toLocaleString());
	await expect(tooltip).toContainText(YANK_N.toLocaleString());
}

test.describe('ThresholdCurveChart', () => {
	test('renders the expected x-axis labels and tooltip values', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		const chart = page.locator('#chart-yank');
		await expect(chart.locator('svg')).toBeVisible();

		const labels = chart.locator('.highcharts-xaxis-labels text');
		await expect(labels).toHaveText([
			'1h',
			'6h',
			'24h',
			'3d',
			'7d',
			'14d',
			'30d',
		]);

		await assertTooltipMatches(page);
	});

	test('linear toggle switches to the reduced day-based label set', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		await page.click('[data-scale-btn="linear"][data-chart="chart-yank"]');

		const labels = page.locator('#chart-yank .highcharts-xaxis-labels text');
		await expect(labels).toHaveText(['3d', '7d', '14d', '30d']);
	});

	test('axis labels and titles use the page type scale, not a hardcoded size', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		const bodyRem = await page.evaluate(() =>
			getComputedStyle(document.documentElement)
				.getPropertyValue('--text-sm')
				.trim(),
		);
		// oxlint-disable-next-line unicorn/prefer-number-coercion
		const expectedPx = `${Number.parseFloat(bodyRem) * 16}px`;

		const tickLabel = page
			.locator('#chart-yank .highcharts-xaxis-labels text')
			.first();
		await expect(tickLabel).toHaveCSS('font-size', expectedPx);

		const axisTitles = page.locator('#chart-yank .highcharts-axis-title');
		await expect(axisTitles).toHaveCount(2);
		await expect(axisTitles.first()).toHaveCSS('font-size', expectedPx);
		await expect(axisTitles.last()).toHaveCSS('font-size', expectedPx);
	});
});
