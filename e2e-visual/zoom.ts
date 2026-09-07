import { expect, type Page } from '@playwright/test';

export async function zoomTo(page: Page, factor: number): Promise<void> {
	await page.evaluate((z) => {
		document.documentElement.style.zoom = String(z);
	}, factor);
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
	const hasHorizontalScroll = await page.evaluate(
		() =>
			document.documentElement.scrollWidth >
			document.documentElement.clientWidth,
	);
	expect(hasHorizontalScroll).toBe(false);
}
