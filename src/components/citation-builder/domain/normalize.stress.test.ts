import { describe, expect, it } from 'vitest';
import { normalizeDocketNumber, normalizeSection } from './normalize';

const REPORTERS_DB_URL =
	'https://raw.githubusercontent.com/freelawproject/reporters-db/main/reporters_db/data/reporters.json';

type ReporterFamily = {
	editions: Record<string, unknown>;
	variations: Record<string, string>;
};

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
			// Trusted test-only external JSON; a runtime schema guard here
			// would be more machinery than this stress test warrants.
			// oxlint-disable-next-line typescript/no-unsafe-type-assertion
			const data = (await response.json()) as Record<string, ReporterFamily[]>;

			const strings = new Set<string>();
			for (const [canonicalKey, families] of Object.entries(data)) {
				strings.add(canonicalKey);
				for (const family of families) {
					for (const edition of Object.keys(family.editions)) {
						strings.add(edition);
					}
					for (const variation of Object.keys(family.variations)) {
						strings.add(variation);
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
