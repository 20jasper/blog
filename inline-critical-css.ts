// oxlint-disable no-await-in-loop -- beasties.process() re-uses the same
// instance's stylesheet cache across calls, so these are deliberately
// sequential rather than parallelized.
import { globSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Beasties from 'beasties';
import type { AstroIntegration } from 'astro';

// oxlint-disable-next-line no-default-export -- Astro integrations are conventionally a default export
export default function inlineCriticalCss(): AstroIntegration {
	return {
		name: 'inline-critical-css',
		hooks: {
			'astro:build:done': async ({ dir }) => {
				const outDir = fileURLToPath(dir);
				// pruneSource stays false (beasties' own upstream default): its
				// critical-CSS detection only sees the static pre-interaction DOM,
				// so pruning would delete :hover/:focus-visible/:disabled rules
				// along with everything else it can't prove is used. Leaving the
				// full stylesheet in place (now loaded non-blocking) means nothing
				// is ever lost, only reordered.
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
