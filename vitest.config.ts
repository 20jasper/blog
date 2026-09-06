import { defineConfig } from 'vitest/config';

// Deliberately scoped, not repo-wide: this is currently the only feature
// under test, and coverage.include/typecheck.include are always
// root-relative (they don't inherit test.dir below), so widening these to
// the whole repo would bury a real 100%-covered feature in 0%s from
// every untested .astro page and chart-data file elsewhere in the blog.
const DOMAIN = 'src/components/citation-builder/domain';

export default defineConfig({
	test: {
		environment: 'node',
		dir: 'src',
		silent: true,
		typecheck: {
			enabled: true,
			include: [`${DOMAIN}/**/*.test.ts`],
		},
		coverage: {
			provider: 'v8',
			include: [`${DOMAIN}/**/*.ts`],
			exclude: [`${DOMAIN}/**/*.test.ts`],
		},
	},
});
