import { expect, test } from '@playwright/test';
import { getCitationBuilderLocators } from './citation-builder-locators';
import { getToaLocators } from './toa-locators';

test('editing and re-saving a citation updates it instead of duplicating it', async ({
	page,
}) => {
	await page.goto('/tools/citations/builder');
	const { party1, party2, volume, reporter, firstPage, pincite, court, year } =
		getCitationBuilderLocators(page);
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

	const { editLink } = getToaLocators(page);
	await expect(editLink).toHaveCount(1);
	await editLink.click();

	await page.waitForURL('**/tools/citations/builder?edit=*');
	await pincite.fill('299');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('**/tools/citations');

	await expect(editLink).toHaveCount(1);
	await expect(page.getByText('299', { exact: false })).toBeVisible();
});

test('using Load Example while editing a saved citation still updates it, not duplicates it', async ({
	page,
}) => {
	await page.goto('/tools/citations/builder');
	const { party1, party2, volume, reporter, firstPage, pincite, court, year } =
		getCitationBuilderLocators(page);
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

	const { editLink } = getToaLocators(page);
	await expect(editLink).toHaveCount(1);
	await editLink.click();
	await page.waitForURL('**/tools/citations/builder?edit=*');

	await page.getByRole('button', { name: 'Load example' }).click();
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('**/tools/citations');

	await expect(editLink).toHaveCount(1);
});
