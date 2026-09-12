// oxlint-disable no-await-in-loop -- beasties.process() reuses one instance's cache across calls
import { globSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Beasties from 'beasties';
import type { AstroIntegration } from 'astro';

// oxlint-disable-next-line no-default-export
export default function inlineCriticalCss(): AstroIntegration {
	return {
		name: 'inline-critical-css',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const outDir = fileURLToPath(dir);
				// pruneSource stays false -- beasties can't detect :hover/:disabled/
				// :focus-visible as "used", so pruning would delete those rules.
				const beasties = new Beasties({
					path: outDir,
					preload: 'media',
					inlineFonts: true,
					compress: true,
					pruneSource: false,
					reduceInlineStyles: false,
					external: true,
				});
				const htmlFiles = globSync('**/*.html', { cwd: outDir });

				for (const file of htmlFiles) {
					const filePath = join(outDir, file);
					const html = await readFile(filePath, 'utf8');
					const inlined = await beasties.process(html);
					await writeFile(filePath, inlined);
				}
			},
		},
	};
}
