import { expect, test } from '@playwright/test';
import {
	PUBLISH_TO_YANK_CHART,
	YANK_DATA,
} from '../src/components/npm-study/data';

// Focus, tooltip, scale-toggle and 0h-pin behaviour are covered without a
// server in src/components/npm-study/mount-threshold-chart.browser.test.ts.
// What's left here needs the real page and a real pointer: a mouse landing on
// the rendered rule itself.
//
// `.ts-chart__rule-x` and `.ts-chart-tooltip` are @tanstack/charts' own DOM
// class names, not ours -- the only stable hooks for a reference-line mark,
// which renders no other identifying attribute. Each ref line renders two
// <line>s: the always-visible 4px rule and the whenFocused 6px copy, which is
// `visibility: hidden` until its x is focused.
const CONTAINER_ID = PUBLISH_TO_YANK_CHART.id;
const REF_LINE_INDEX = PUBLISH_TO_YANK_CHART.refLines.findIndex(
	(r) => r.hours === 24,
);
const REF_LINE = PUBLISH_TO_YANK_CHART.refLines[REF_LINE_INDEX]!;
const POINT_24H = YANK_DATA.find((d) => d.hours === 24)!;

const expectedTooltip = `${REF_LINE.label} (24h) — ${PUBLISH_TO_YANK_CHART.tooltipVerb} ${POINT_24H.percentRemoved}% (${POINT_24H.count.toLocaleString()} of ${PUBLISH_TO_YANK_CHART.total.toLocaleString()})`;

test('real mouse hover on the 24h ref line brightens it and shows the merged tooltip', async ({
	page,
}) => {
	await page.goto('/test-fixtures/threshold-chart');
	const rules = page.locator(`#${CONTAINER_ID} .ts-chart__rule-x line`);
	const baseLine = rules
		.and(page.locator('[stroke-width="4"]'))
		.nth(REF_LINE_INDEX);

	// boundingBox() is relative to the viewport -- off-screen coordinates would
	// make mouse.move() land nowhere near the actual line.
	await baseLine.scrollIntoViewIfNeeded();
	const box = await baseLine.boundingBox();
	if (!box) throw new Error('ref line has no bounding box');
	await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
		steps: 5,
	});

	// Vertical lines have a zero-width box, so toBeVisible() calls them hidden;
	// read the computed `visibility` instead.
	await expect(
		rules.and(page.locator('[stroke-width="6"]')).nth(REF_LINE_INDEX),
	).toHaveCSS('visibility', 'visible');
	await expect(page.locator(`#${CONTAINER_ID} .ts-chart-tooltip`)).toHaveText(
		expectedTooltip,
	);
});
