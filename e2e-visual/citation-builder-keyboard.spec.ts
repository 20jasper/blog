// oxlint-disable no-await-in-loop -- simulating sequential Tab presses is
// inherently sequential: each press must land before the next is sent.
import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { getCitationBuilderLocators } from './citation-builder-locators';
import { getToaLocators } from './toa-locators';

async function isFocused(locator: Locator): Promise<boolean> {
	const handle = await locator.elementHandle();
	return (
		handle !== null && handle.evaluate((el) => el === document.activeElement)
	);
}

async function tabUntilFocused(
	page: Page,
	locator: Locator,
	maxPresses: number,
): Promise<boolean> {
	for (let i = 0; i < maxPresses; i++) {
		await page.keyboard.press('Tab');
		if (await isFocused(locator)) {
			return true;
		}
	}
	return false;
}

type FocusSnapshot = { id: string; outlineStyle: string } | null;

async function tabUntil(
	page: Page,
	predicate: (snapshot: NonNullable<FocusSnapshot>) => boolean,
	seen: Set<string>,
	maxPresses: number,
): Promise<FocusSnapshot> {
	for (let i = 0; i < maxPresses; i++) {
		await page.keyboard.press('Tab');
		const snapshot = await page.evaluate(() => {
			const el = document.activeElement;
			if (el === null || el === document.body) {
				return null;
			}
			return {
				id: el.id || el.tagName,
				outlineStyle: getComputedStyle(el).outlineStyle,
			};
		});
		if (snapshot === null) {
			continue;
		}
		seen.add(snapshot.id);
		if (predicate(snapshot)) {
			return snapshot;
		}
	}
	return null;
}

test.describe('citation builder keyboard navigation', () => {
	test('tabbing reaches the primary actions with a visible focus indicator, no trap', async ({
		page,
	}) => {
		await page.goto('/tools/citations/builder');
		const { clearButton, copyButton, saveButton } =
			getCitationBuilderLocators(page);

		const seen = new Set<string>();
		const save = await tabUntil(page, (s) => s.id === 'save-button', seen, 120);

		expect(save, 'Tab should reach the Save button').not.toBeNull();
		expect(
			save?.outlineStyle,
			'Save button should render a visible focus indicator when focused via keyboard',
		).not.toBe('none');

		// A trapped focus would never leave the first element it landed on.
		expect(seen.size).toBeGreaterThan(10);

		await expect(clearButton).toBeVisible();
		await expect(copyButton).toBeVisible();
		await expect(saveButton).toBeVisible();
	});

	test('tabbing on Saved Citations reaches Edit, Copy, and Delete for a saved item', async ({
		page,
	}) => {
		await page.goto('/tools/citations/builder');
		const {
			party1,
			party2,
			volume,
			reporter,
			firstPage,
			pincite,
			court,
			year,
		} = getCitationBuilderLocators(page);
		await party1.fill('Dayton');
		await party2.fill('Stewart');
		await volume.fill('179');
		await reporter.fill('N.E.3d');
		await firstPage.fill('208');
		await pincite.fill('214');
		await court.fill('Ohio Ct. App.');
		await year.fill('2021');
		await page.getByRole('button', { name: 'Save' }).click();
		await page.waitForURL('**/tools/citations');

		const { editLink, copyButton, deleteButton } = getToaLocators(page);
		expect(
			await tabUntilFocused(page, editLink, 40),
			'Tab should reach the Edit link',
		).toBe(true);
		expect(
			await tabUntilFocused(page, copyButton, 40),
			'Tab should reach the Copy button',
		).toBe(true);
		expect(
			await tabUntilFocused(page, deleteButton, 40),
			'Tab should reach the Delete button',
		).toBe(true);
	});
});
