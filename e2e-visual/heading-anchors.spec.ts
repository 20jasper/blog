import { expect, test } from '@playwright/test';

const POST = '/blog/committing-to-learning-go-in-2026';
const HEADING_ID = 'pros';

test('heading has a stable id and an anchor link pointing to it', async ({
	page,
}) => {
	await page.goto(POST);

	const heading = page.locator(`#${HEADING_ID}`);
	await expect(heading).toBeVisible();

	const anchor = heading.locator('a.heading-anchor');
	await expect(anchor).toHaveAttribute('href', `#${HEADING_ID}`);
});

test('anchor is hidden until the heading is hovered', async ({ page }) => {
	await page.goto(POST);

	const anchor = page.locator(`#${HEADING_ID} a.heading-anchor`);
	await expect(anchor).toHaveCSS('opacity', '0');

	await page.locator(`#${HEADING_ID}`).hover();
	await expect(anchor).toHaveCSS('opacity', '1');
});

test('clicking the anchor updates the URL hash', async ({ page }) => {
	await page.goto(POST);

	await page.locator(`#${HEADING_ID}`).hover();
	await page.locator(`#${HEADING_ID} a.heading-anchor`).click();

	await expect(page).toHaveURL(new RegExp(`#${HEADING_ID}$`, 'u'));
});

test('linking directly to a heading hash scrolls it into view', async ({
	page,
}) => {
	await page.goto(`${POST}#${HEADING_ID}`);

	await expect(page.locator(`#${HEADING_ID}`)).toBeInViewport();
});
