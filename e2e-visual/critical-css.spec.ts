import { expect, test } from '@playwright/test';

test('body is styled correctly even if the stylesheet is slow to arrive', async ({
	page,
}) => {
	await page.route('**/*.css', async (route) => {
		await new Promise((resolve) => setTimeout(resolve, 2000));
		await route.continue();
	});

	const navigation = page.goto('/blog');
	await page.waitForSelector('body');
	// Sampled well before the 2s-delayed stylesheet can have arrived --
	// only the inlined critical CSS could have applied by this point.
	const background = await page.evaluate(
		() => getComputedStyle(document.body).backgroundColor,
	);

	expect(background).toBe('rgb(0, 0, 19)');
	await navigation;
});
