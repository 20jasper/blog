import {
	array,
	assert,
	boolean,
	constantFrom,
	integer,
	nat,
	oneof,
	property,
	string,
	tuple,
} from 'fast-check';
import { describe, expect, it } from 'vitest';
import { parsePincite, reduceClosingPage } from './pincite';

// r[verify normalize.span-digits]
describe('reduceClosingPage', () => {
	it.each([
		['111', '112', '12', 'common prefix `11`, two-digit floor'],
		['495', '497', '97', 'common prefix `49`'],
		['190', '192', '92', 'common prefix `19`'],
		['1137', '1138', '38', 'common prefix `113`'],
		['208', '214', '14', 'common prefix `2`'],
		['1099', '1101', '101', 'common prefix `1`, three digits retained'],
		['199', '201', '201', 'no common prefix'],
		['498', '503', '503', 'hundreds digit changes'],
		['44', '45', '45', 'two-digit span, floor applies'],
		['8', '10', '10', 'differing digit counts'],
		['495', '97', '97', 'already reduced, unchanged'],
	])('%s-%s -> %s (%s)', (start, end, expected) => {
		expect(reduceClosingPage(start, end)).toBe(expected);
	});
});

// r[verify pincite.parse]
// r[verify normalize.span-input]
// r[verify normalize.span-nonconsecutive]
// r[verify normalize.span-separator]
describe('parsePincite', () => {
	it.each([
		['214', {}, '214'],
		['208-214', {}, '208-14'],
		['208-214', { separator: '–' as const }, '208–14'],
		['1-2', { starPages: true }, '*1-2'],
		['1, 3', { starPages: true }, '*1, *3'],
		['4, 12', { starPages: true }, '*4, *12'],
		['490, 495', {}, '490, 495'],
		['188, 190-193', {}, '188, 190-93'],
		['495-497, 501', {}, '495-97, 501'],
		['1099-1101', {}, '1099-101'],
		['495-97', {}, '495-97'],
	])('%s with %j -> %s', (raw, opts, expected) => {
		expect(
			parsePincite(raw, { separator: '-', starPages: false, ...opts }),
		).toBe(expected);
	});
});

// r[verify pincite.no-validation]
// r[verify normalize.span-passthrough]
describe('parsePincite: non-numeric passthrough', () => {
	it.each([
		['1137 n.4', '1137 n.4'],
		['¶ 12', '¶ 12'],
	])('%s -> %s (accepted, not validated)', (raw, expected) => {
		expect(parsePincite(raw, { separator: '-', starPages: false })).toBe(
			expected,
		);
	});
});

// Properties, not hand-picked cases: generate arbitrary page/range
// components rather than relying on the fixed examples above to happen
// to cover every shape.
describe('parsePincite: properties', () => {
	const page = nat(999999).map(String);
	const range = tuple(nat(999999), nat(999999)).map(([a, b]) => `${a}-${b}`);
	const component = oneof(page, range);
	const components = array(component, { minLength: 1, maxLength: 5 });

	it('preserves the number of comma-separated components', () => {
		assert(
			property(components, (parts) => {
				const result = parsePincite(parts.join(', '), {
					separator: '-',
					starPages: false,
				});
				expect(result.split(', ')).toHaveLength(parts.length);
			}),
		);
	});

	it('every component gets the star prefix iff starPages is true', () => {
		assert(
			property(components, boolean(), (parts, starPages) => {
				const result = parsePincite(parts.join(', '), {
					separator: '-',
					starPages,
				});
				for (const segment of result.split(', ')) {
					expect(segment.startsWith('*')).toBe(starPages);
				}
			}),
		);
	});

	it('a numeric range always renders with the configured separator', () => {
		assert(
			property(
				nat(999999),
				nat(999999),
				constantFrom('-' as const, '–' as const),
				(a, b, separator) => {
					const result = parsePincite(`${a}-${b}`, {
						separator,
						starPages: false,
					});
					expect(result).toContain(separator);
				},
			),
		);
	});

	// SPAN also runs against freeform text on every keystroke; no nested
	// quantifiers so it shouldn't backtrack catastrophically, but that's
	// worth confirming rather than assuming.
	it('stays fast on long adversarial input', () => {
		assert(
			property(
				string({ minLength: 1, maxLength: 50 }),
				integer({ min: 1, max: 2000 }),
				(unit, repeat) => {
					const start = performance.now();
					parsePincite(unit.repeat(repeat), {
						separator: '-',
						starPages: false,
					});
					expect(performance.now() - start).toBeLessThan(50);
				},
			),
		);
	});
});
