import { describe, expect, it } from 'vitest';
import { normalizeDocketNumber, normalizeSection } from './normalize';

const REPORTERS_DB_URL =
	'https://raw.githubusercontent.com/freelawproject/reporters-db/main/reporters_db/data/reporters.json';

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function keysOf(value: unknown): string[] {
	return isRecord(value) ? Object.keys(value) : [];
}

// r[verify normalize.stress]
describe('normalization stress test against reporters-db', () => {
	// Opt-in and network-dependent, so it's skipped by default -- run via
	// `pnpm test:stress`. Guarding by env var rather than excluding the
	// file from vitest's config, since "*.test.ts" matches the default
	// include glob regardless of what precedes ".test.ts".
	it.skipIf(process.env.RUN_STRESS_TEST === undefined)(
		'never throws and is idempotent for every real-world reporter string in reporters-db',
		async () => {
			const response = await fetch(REPORTERS_DB_URL);
			const data: unknown = await response.json();

			const strings = new Set<string>();
			if (isRecord(data)) {
				for (const [canonicalKey, families] of Object.entries(data)) {
					strings.add(canonicalKey);
					if (!Array.isArray(families)) {
						continue;
					}
					for (const family of families) {
						if (!isRecord(family)) {
							continue;
						}
						for (const edition of keysOf(family.editions)) {
							strings.add(edition);
						}
						for (const variation of keysOf(family.variations)) {
							strings.add(variation);
						}
					}
				}
			}

			expect(strings.size).toBeGreaterThan(1000);

			for (const input of strings) {
				expect(() => normalizeDocketNumber(input)).not.toThrow();
				expect(() => normalizeSection(input)).not.toThrow();

				const docket = normalizeDocketNumber(input);
				expect(normalizeDocketNumber(docket)).toBe(docket);

				const section = normalizeSection(input);
				expect(normalizeSection(section)).toBe(section);
			}
		},
	);
});
