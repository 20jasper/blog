import { expect, test, type Page } from '@playwright/test';

test('start screen is shown before starting', async ({ page }) => {
	await page.goto('/quiz');
	await expect(page.getByRole('button', { name: 'Start Quiz' })).toBeVisible();
	await expect(page.locator('#question-container')).toBeHidden();
});

test('starting the quiz reveals the first question', async ({ page }) => {
	await page.goto('/quiz');
	await page.getByRole('button', { name: 'Start Quiz' }).click();

	await expect(page.locator('#starting-explanation')).toBeHidden();
	await expect(page.locator('#question')).toHaveText(/question 1 of \d+/u);
	await expect(page.locator('#question-code')).not.toBeEmpty();
});

test('choosing the correct answer shows correct feedback', async ({ page }) => {
	await page.goto('/quiz');
	await page.getByRole('button', { name: 'Start Quiz' }).click();

	// first question in the bank is valid JSON
	await page.getByRole('button', { name: 'valid', exact: true }).click();

	await expect(page.locator('#valid-or-not')).toContainText('Correct');
	await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
	await expect(page.locator('#options')).toBeHidden();
});

test('choosing the wrong answer shows wrong feedback', async ({ page }) => {
	await page.goto('/quiz');
	await page.getByRole('button', { name: 'Start Quiz' }).click();

	// first question in the bank is valid JSON, so "invalid" is wrong
	await page.getByRole('button', { name: 'invalid', exact: true }).click();

	await expect(page.locator('#valid-or-not')).toContainText('Wrong');
});

test('next advances to the following question', async ({ page }) => {
	await page.goto('/quiz');
	await page.getByRole('button', { name: 'Start Quiz' }).click();
	await page.getByRole('button', { name: 'valid', exact: true }).click();
	await page.getByRole('button', { name: 'Next' }).click();

	await expect(page.locator('#question')).toHaveText(/question 2 of \d+/u);
	await expect(page.getByRole('button', { name: 'Next' })).toBeHidden();
	await expect(page.locator('#options')).toBeVisible();
});

test('finishing every question shows the final score', async ({ page }) => {
	await page.goto('/quiz');
	await page.getByRole('button', { name: 'Start Quiz' }).click();

	const questionText = await page.locator('#question').textContent();
	const totalQuestions = Number(questionText?.match(/of (\d+)/u)?.[1]);
	expect(totalQuestions).toBeGreaterThan(0);

	await answerEveryQuestion(page, totalQuestions);

	await expect(page.locator('#question-container')).toHaveCount(0);
	await expect(page.locator('#final-score')).toHaveText(
		new RegExp(`I scored \\d+/${totalQuestions} on`, 'u'),
	);
});

async function answerEveryQuestion(
	page: Page,
	totalQuestions: number,
): Promise<void> {
	for (let i = 0; i < totalQuestions; i++) {
		// oxlint-disable-next-line no-await-in-loop
		await page.locator('#options button').first().click();
		// oxlint-disable-next-line no-await-in-loop
		await page.getByRole('button', { name: 'Next' }).click();
	}
}
