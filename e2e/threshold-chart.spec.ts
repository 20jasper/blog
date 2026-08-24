import { expect, test, type Page } from '@playwright/test';
import {
	PUBLISH_TO_YANK_CHART,
	YANK_DATA,
} from '../src/components/npm-study/data';

const CONTAINER_ID = PUBLISH_TO_YANK_CHART.id;
const REF_LINE_INDEX = PUBLISH_TO_YANK_CHART.refLines!.findIndex(
	(r) => r.hours === 24,
);
const REF_LINE = PUBLISH_TO_YANK_CHART.refLines![REF_LINE_INDEX]!;
const POINT_24H = YANK_DATA.find((d) => d.hours === 24)!;
const POINT_24H_INDEX = YANK_DATA.findIndex((d) => d.hours === 24);

const expectedTooltip = `${REF_LINE.label} (24h) — ${PUBLISH_TO_YANK_CHART.tooltipVerb} ${POINT_24H.percentRemoved}% (${POINT_24H.count.toLocaleString()} of ${PUBLISH_TO_YANK_CHART.total.toLocaleString()})`;

// Focus starts on the first line point (h=1); ArrowRight steps through the
// rest in data order.
async function focusPoint24h(page: Page) {
	const svg = page.locator(`#${CONTAINER_ID} svg`);
	await svg.focus();
	for (let i = 0; i < POINT_24H_INDEX; i++) {
		await page.keyboard.press('ArrowRight');
	}
}

// A reference line has no hit-testing of its own, and its point never wins
// nearest-point resolution against the real line data at the same x -- both
// the "light up" and the merged tooltip text are keyed off recognizing that
// coincidence instead (see threshold-curve-chart.astro). These tests exist
// to catch a regression in that indirection, which is easy to silently
// break.
//
// `.ts-chart__rule-x` and `.ts-chart-tooltip` are @tanstack/charts' own DOM
// class names, not ours -- they're the only stable hooks available for a
// reference-line mark, which renders no other identifying attribute. If the
// charting library is ever swapped, these two selectors (and no others in
// this file) are what need updating.
test.describe('threshold chart ref-line focus', () => {
	test('real mouse hover on the 24h ref line brightens it and shows the merged tooltip', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		const refLineEl = page
			.locator(`#${CONTAINER_ID} .ts-chart__rule-x line`)
			.nth(REF_LINE_INDEX);
		const before = await refLineEl.evaluate(
			(el) => getComputedStyle(el).strokeWidth,
		);

		// boundingBox() is relative to the viewport -- off-screen coordinates
		// would make mouse.move() land nowhere near the actual line.
		await refLineEl.scrollIntoViewIfNeeded();
		const box = await refLineEl.boundingBox();
		if (!box) throw new Error('ref line has no bounding box');
		await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
			steps: 5,
		});

		await expect(refLineEl).not.toHaveCSS('stroke-width', before);
		await expect(page.locator(`#${CONTAINER_ID} .ts-chart-tooltip`)).toHaveText(
			expectedTooltip,
		);
	});

	test('keyboard nav to the 24h point brightens the ref line and shows the same tooltip', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');
		await focusPoint24h(page);

		const refLineEl = page
			.locator(`#${CONTAINER_ID} .ts-chart__rule-x`)
			.nth(REF_LINE_INDEX);
		await expect(refLineEl).toHaveClass(/is-focused/);
		await expect(refLineEl.locator('line')).toHaveCSS('stroke-width', '6px');
		await expect(page.locator(`#${CONTAINER_ID} .ts-chart-tooltip`)).toHaveText(
			expectedTooltip,
		);
	});

	test('moving focus away clears the brightened state', async ({ page }) => {
		await page.goto('/test-fixtures/threshold-chart');
		await focusPoint24h(page);
		await expect(
			page.locator(`#${CONTAINER_ID} .ts-chart__rule-x`).nth(REF_LINE_INDEX),
		).toHaveClass(/is-focused/);

		await page.keyboard.press('ArrowRight');

		await expect(
			page.locator(`#${CONTAINER_ID} .ts-chart__rule-x.is-focused`),
		).toHaveCount(0);
	});
});

// The 0h ref line (npm/Yarn/Bun default) has no real 0h data point and no
// axis tick to land on -- it's clamped to the log axis's domain minimum
// (1h), which happens to be the real first data point. Regression test for a
// bug where the merge lookup was keyed by the ref line's raw hour (0)
// instead of its plotted position (1), so this point's tooltip/glow never
// fired.
test.describe('threshold chart 0h ref line', () => {
	test('the first point (1h) surfaces the merged 0h ref-line tooltip and glow', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		const zeroHourLine = PUBLISH_TO_YANK_CHART.refLines!.find(
			(r) => r.hours === 0,
		)!;
		const zeroHourIndex = PUBLISH_TO_YANK_CHART.refLines!.findIndex(
			(r) => r.hours === 0,
		);
		const point1h = YANK_DATA[0]!;
		const expected = `${zeroHourLine.label} (0h) — ${PUBLISH_TO_YANK_CHART.tooltipVerb} ${point1h.percentRemoved}% (${point1h.count.toLocaleString()} of ${PUBLISH_TO_YANK_CHART.total.toLocaleString()})`;

		const svg = page.locator(`#${CONTAINER_ID} svg`);
		await svg.focus();

		const refLineEl = page
			.locator(`#${CONTAINER_ID} .ts-chart__rule-x`)
			.nth(zeroHourIndex);
		await expect(refLineEl).toHaveClass(/is-focused/);
		await expect(page.locator(`#${CONTAINER_ID} .ts-chart-tooltip`)).toHaveText(
			expected,
		);
	});
});

test.describe('threshold chart accessibility', () => {
	test('aria-label names the chart, not its x-axis', async ({ page }) => {
		await page.goto('/test-fixtures/threshold-chart');

		await expect(page.locator(`#${CONTAINER_ID} svg`)).toHaveAttribute(
			'aria-label',
			PUBLISH_TO_YANK_CHART.title,
		);
	});

	test('the library-drawn focus dot appears and moves as focus changes', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');

		// @tanstack/charts draws this automatically for any mark without a
		// custom mark.focus config -- one circle per point, visibility toggled
		// as focus moves. Not our markup; see docs/tanstack-charts-feedback.md
		// item 1.
		const svg = page.locator(`#${CONTAINER_ID} svg`);
		const dot = svg.locator('.ts-chart__focus-layer--default circle:visible');
		await svg.focus();
		await page.keyboard.press('ArrowRight');

		await expect(dot).toBeVisible();
		const firstPosition = await dot.evaluate((el) => el.getAttribute('cx'));

		await page.keyboard.press('ArrowRight');
		await expect(dot).not.toHaveAttribute('cx', firstPosition!);
	});
});

// host.update() (fired on every scale-toggle click) rebuilds the whole SVG,
// destroying whatever point was focused. Without explicitly clearing focus
// first, the tooltip (state the host owns) and the glow/dot (state owned
// here, tied to the now-destroyed DOM) fall out of sync -- e.g. a tooltip
// that keeps rendering stale text under `display: none` is easy to miss by
// only checking textContent instead of actual visibility.
test.describe('threshold chart scale toggle', () => {
	test('toggling scale mid-focus clears the tooltip, glow, and focus dot together', async ({
		page,
	}) => {
		await page.goto('/test-fixtures/threshold-chart');
		await focusPoint24h(page);

		const tooltip = page.locator(`#${CONTAINER_ID} .ts-chart-tooltip`);
		const dot = page.locator(
			`#${CONTAINER_ID} .ts-chart__focus-layer--default circle:visible`,
		);
		await expect(tooltip).toBeVisible();
		await expect(dot).toBeVisible();

		await page.click(`[data-scale-btn="linear"][data-chart="${CONTAINER_ID}"]`);

		await expect(tooltip).toBeHidden();
		await expect(
			page.locator(`#${CONTAINER_ID} .ts-chart__rule-x.is-focused`),
		).toHaveCount(0);
		// The dot lives inside the SVG that update() just replaced -- nothing
		// should be visible again until focus lands on a point.
		await expect(dot).toHaveCount(0);
	});
});
