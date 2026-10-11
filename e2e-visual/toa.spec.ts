import { expect, test } from '@playwright/test';
import { getCitationBuilderLocators } from './citation-builder-locators';
import { getToaLocators } from './toa-locators';
import { expectNoHorizontalScroll } from './zoom';

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

test('saved notes show in the list and comes back when editing', async ({
	page,
}) => {
	const notes = 'The statute is unambiguous.';
	await page.goto('/tools/citations/builder');
	const { notes: notesInput, saveButton } = getCitationBuilderLocators(page);
	await notesInput.fill(notes);
	await saveButton.click();
	await page.waitForURL('**/tools/citations');

	await expect(page.getByText(notes)).toBeVisible();

	await getToaLocators(page).editLink.click();
	await page.waitForURL('**/tools/citations/builder?edit=*');
	await expect(notesInput).toHaveValue(notes);
});

test('the form picker disables forms the saved fields cannot fill', async ({
	page,
}) => {
	await page.goto('/tools/citations/builder');
	await getCitationBuilderLocators(page).pincite.fill('');
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('**/tools/citations');

	const picker = page.getByRole('combobox', { name: /^Form to copy for /u });
	await expect(picker).toHaveValue('full');
	await expect(
		picker.getByRole('option', { name: 'Full citation' }),
	).toBeEnabled();
	await expect(picker.getByRole('option', { name: 'Id.' })).toBeDisabled();
	await expect(
		page.getByText('Disabled selections mean some fields are missing'),
	).toBeVisible();
});

test('a saved citation fits on screen with its form picker and notes', async ({
	page,
}) => {
	await page.goto('/tools/citations/builder');
	await getCitationBuilderLocators(page).notes.fill(
		'Cited for the standard of review.\nSee also the dissent.',
	);
	await page.getByRole('button', { name: 'Save' }).click();
	await page.waitForURL('**/tools/citations');

	const { copyButton, editLink, deleteButton } = getToaLocators(page);
	const picker = page.getByRole('combobox', { name: /^Form to copy for /u });
	await Promise.all(
		[picker, copyButton, editLink, deleteButton].map((control) =>
			expect(control).toBeInViewport(),
		),
	);
	await expectNoHorizontalScroll(page);
	await expect(page).toHaveScreenshot('saved-list.png', {
		fullPage: true,
		animations: 'disabled',
	});
});
