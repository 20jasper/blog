import { test } from '@playwright/test';
import { expectNoHorizontalScroll } from './zoom';

test('a long unbreakable word in a heading wraps instead of widening the page', async ({
	page,
}) => {
	await page.setViewportSize({ width: 320, height: 720 });
	await page.goto('/test-fixtures/markdown-kitchen-sink');

	await expectNoHorizontalScroll(page);
});
