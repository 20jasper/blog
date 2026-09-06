import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		dir: 'src',
		silent: true,
		typecheck: {
			enabled: true,
			include: ['src/components/citation-builder/domain/**/*.test.ts'],
		},
		coverage: {
			provider: 'v8',
			include: ['src/components/citation-builder/domain/**/*.ts'],
			exclude: ['src/components/citation-builder/domain/**/*.test.ts'],
		},
	},
});
