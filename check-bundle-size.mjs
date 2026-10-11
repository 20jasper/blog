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
			`${file}: ${(bytes / 1024).toFixed(1)} KB > ${MAX_BYTES / 1024} KB budget`,
		);
	}
	process.exit(1);
}

console.log(`Bundle size OK (< ${MAX_BYTES / 1024} KB per chunk).`);
