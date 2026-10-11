import type { Page } from '@playwright/test';

export function getToaLocators(page: Page) {
	return {
		editLink: page.getByRole('link', { name: /^Edit /u }),
		copyButton: page.getByRole('button', { name: /^Copy /u }),
		deleteButton: page.getByRole('button', { name: /^Delete /u }),
	};
}
