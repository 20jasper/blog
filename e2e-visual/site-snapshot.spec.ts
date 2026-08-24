import { expect, test } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { AxeBuilder } from '@axe-core/playwright';

const CURATED_ROUTES = [
	'/blog',
	'/reading-list',
	'/quiz',
	'/blog/we-should-replace-fifa-with-a-bunch-of-roundabouts',
	'/blog/it-takes-26-yottabytes-of-ram-to-typecheck-a-union-of-safe-integers',
	'/blog/committing-to-learning-go-in-2026',
];

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const EXCLUDED_PREFIXES = ['/test-fixtures', '/passwords.txt', '/projects'];

function discoverRoutes(dir: string, base = ''): string[] {
	const routes: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			routes.push(...discoverRoutes(full, `${base}/${entry}`));
		} else if (entry === 'index.html') {
			routes.push(base === '' ? '/' : base);
		}
	}
	return routes;
}

const allRoutes = discoverRoutes(DIST_DIR).filter(
	(route) => !EXCLUDED_PREFIXES.some((prefix) => route.startsWith(prefix)),
);

test.describe('visual regression (curated pages)', () => {
	for (const route of CURATED_ROUTES) {
		test(`${route} matches its baseline`, async ({ page }) => {
			await page.goto(route);
			await page.waitForLoadState('networkidle');
			await expect(page).toHaveScreenshot(
				`${route === '/' ? 'home' : route.replaceAll('/', '_')}.png`,
				{ fullPage: true, animations: 'disabled' },
			);
		});
	}
});

test.describe('accessibility (every page)', () => {
	for (const route of allRoutes) {
		test(`${route} has no axe violations`, async ({ page }) => {
			await page.goto(route);
			await page.waitForLoadState('networkidle');
			const results = await new AxeBuilder({ page }).analyze();
			expect(
				results.violations,
				JSON.stringify(results.violations, null, 2),
			).toEqual([]);
		});
	}
});
