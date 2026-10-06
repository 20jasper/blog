import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ASTRO_DIR = 'dist/_astro';
const DEFAULT_MAX_BYTES = 35 * 1024;
const MAX_BYTES_BY_CHUNK = [{ prefix: 'charts.', maxBytes: 120 * 1024 }];

/** @param {string} file */
const maxBytesFor = (file) =>
	MAX_BYTES_BY_CHUNK.find(({ prefix }) => file.startsWith(prefix))?.maxBytes ??
	DEFAULT_MAX_BYTES;

const oversized = readdirSync(ASTRO_DIR)
	.filter((file) => file.endsWith('.js'))
	.map((file) => ({
		file,
		bytes: statSync(join(ASTRO_DIR, file)).size,
		maxBytes: maxBytesFor(file),
	}))
	.filter(({ bytes, maxBytes }) => bytes > maxBytes);

if (oversized.length > 0) {
	for (const { file, bytes, maxBytes } of oversized) {
		console.error(
			`${file}: ${(bytes / 1024).toFixed(1)} KB > ${maxBytes / 1024} KB budget`,
		);
	}
	process.exit(1);
}

console.log('Bundle size OK.');
