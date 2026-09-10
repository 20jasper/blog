import { defineConfig } from 'vitest/config';

export default defineConfig({
	resolve: {
		tsconfigPaths: true,
	},
	test: {
		environment: 'node',
		dir: 'src',
		silent: true,
		typecheck: {
			enabled: true,
		},
		coverage: {
			provider: 'v8',
		},
	},
});
