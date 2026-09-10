import { expect, type Page } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

export async function expectNoAxeViolations(page: Page): Promise<void> {
	const { violations } = await new AxeBuilder({ page }).analyze();
	expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
}
