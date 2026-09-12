import { globSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Beasties from 'beasties';
import type { AstroIntegration } from 'astro';

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

				await Promise.all(
					htmlFiles.map(async (file) => {
						const filePath = join(outDir, file);
						const html = await readFile(filePath, 'utf8');
						const inlined = await beasties.process(html);
						await writeFile(filePath, inlined);
					}),
				);
			},
		},
	};
}
