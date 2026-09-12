import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASTRO_DIR = 'dist/_astro';
const MAX_BYTES = 35 * 1024;

const oversized = readdirSync(ASTRO_DIR)
	.filter((file) => file.endsWith('.js'))
	.map((file) => ({ file, bytes: statSync(join(ASTRO_DIR, file)).size }))
	.filter(({ bytes }) => bytes > MAX_BYTES);

if (oversized.length > 0) {
	for (const { file, bytes } of oversized) {
		console.error(
			`${file}: ${(bytes / 1024).toFixed(1)} KB exceeds the ${MAX_BYTES / 1024} KB client bundle budget`,
		);
	}
	console.error(
		'\nA client-shipped JS chunk grew past the budget. If this is legitimate ' +
			'new functionality, raise MAX_BYTES in check-bundle-size.mjs deliberately ' +
			'-- if not, something (often a shared barrel re-exporting build-time-only ' +
			'data alongside client code) is pulling in more than it should.',
	);
	process.exit(1);
}

console.log(
	`Bundle size check passed (all client JS chunks under ${MAX_BYTES / 1024} KB).`,
);
