import { expect, test, type Page } from '@playwright/test';
import { globSync } from 'node:fs';
import { join } from 'node:path';
import { expectNoAxeViolations } from './axe';
import { expectNoHorizontalScroll } from './zoom';

async function forceLoadLazyImages(page: Page): Promise<void> {
	await page.evaluate(async () => {
		const images = Array.from(
			document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'),
		);
		const promises = images.map((image) => {
			return new Promise<void>((resolve) => {
				image.setAttribute('loading', 'eager');
				image.setAttribute('decoding', 'sync');
				image.loading = 'eager';
				image.decoding = 'sync';

				const done = () => resolve();
				if (image.complete && image.naturalWidth > 0) {
					resolve();
					return;
				}
				image.addEventListener('load', done, { once: true });
				image.addEventListener('error', done, { once: true });

				const { src } = image;
				image.src = '';
				image.src = src;
			});
		});
		await Promise.all(promises);
		await Promise.all(
			Array.from(document.images).map((image) => {
				const loadPromise =
					image.complete && image.naturalWidth > 0
						? Promise.resolve()
						: new Promise<void>((resolve) => {
								image.addEventListener('load', () => resolve(), {
									once: true,
								});
								image.addEventListener('error', () => resolve(), {
									once: true,
								});
							});
				return loadPromise.then(() =>
					typeof image.decode === 'function'
						? image.decode().catch(() => {})
						: undefined,
				);
			}),
		);
		await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts
			?.ready;
		await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
		await new Promise((resolve) => setTimeout(resolve, 3000));
		// Wait until layout stops shifting.
		await (async () => {
			let last = document.documentElement.scrollHeight;
			let stable = 0;
			while (stable < 1000) {
				await new Promise((r) => setTimeout(r, 100));
				const cur = document.documentElement.scrollHeight;
				if (cur === last) stable += 100;
				else {
					stable = 0;
					last = cur;
				}
			}
		})();
	});

	await page.waitForLoadState('networkidle');
}

const CURATED_ROUTES = [
	'/blog',
	'/quiz',
	'/blog/we-should-replace-fifa-with-a-bunch-of-roundabouts',
	'/blog/it-takes-26-yottabytes-of-ram-to-typecheck-a-union-of-safe-integers',
	'/blog/committing-to-learning-go-in-2026',
];

const DIST_DIR = join(import.meta.dirname, '..', 'dist');
const EXCLUDED_PREFIXES = ['/test-fixtures', '/passwords.txt', '/projects'];

function discoverRoutes(dir: string): string[] {
	return globSync('**/index.html', { cwd: dir }).map(
		(match) => `/${match.replace(/index\.html$/u, '').replace(/\/$/u, '')}`,
	);
}

const allRoutes = discoverRoutes(DIST_DIR).filter(
	(route) => !EXCLUDED_PREFIXES.some((prefix) => route.startsWith(prefix)),
);

test.describe('visual regression (curated pages)', () => {
	for (const route of CURATED_ROUTES) {
		test(`${route} matches its baseline`, async ({ page }) => {
			await page.goto(route);
			// wait for page to load and images to decode
			await forceLoadLazyImages(page);
			await expect(page).toHaveScreenshot(
				`${route === '/' ? 'home' : route.replaceAll('/', '_')}.png`,
				{ fullPage: true, animations: 'disabled' },
			);
		});
	}
});

test.describe('accessibility and layout (every page)', () => {
	for (const route of allRoutes) {
		test.describe(route, () => {
			test.beforeEach(async ({ page }) => {
				await page.goto(route);
				await page.waitForLoadState('networkidle');
			});

			test('has no horizontal scroll', async ({ page }) => {
				await expectNoHorizontalScroll(page);
			});

			test('has no axe violations', async ({ page, browserName }) => {
				test.skip(
					browserName !== 'chromium' && process.env.FULL_AXE_SCAN !== 'true',
					'axe scan restricted to chromium by default -- set FULL_AXE_SCAN=true to run on every browser',
				);
				await expectNoAxeViolations(page);
			});
		});
	}
});
