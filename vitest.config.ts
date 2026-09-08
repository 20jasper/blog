import { defineConfig } from 'vitest/config';

export default defineConfig({
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
