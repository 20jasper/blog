import { assert, property, string } from 'fast-check';
import { describe, expect, it } from 'vitest';
import { applyFraming, render } from './render';
import type { Segment } from './types';

// Lowercased so the capitalization behavior under test is visible in the
// expected output rather than already true of the input.
const LOWERCASE_NAME = 'dayton v. stewart';

// r[verify framing.parameter]
describe('applyFraming', () => {
	it.each([
		[true, 'Dayton v. stewart'],
		[false, 'dayton v. stewart'],
	])('capitalizeFirst: %s -> %j', (capitalizeFirst, expected) => {
		const segments: Segment[] = [{ text: LOWERCASE_NAME, emphasized: true }];

		const [framed] = applyFraming(segments, {
			capitalizeFirst,
			terminalPeriod: false,
		});

		expect(framed?.text).toBe(expected);
	});

	it('leaves an empty first-segment text untouched rather than throwing', () => {
		const segments: Segment[] = [{ text: '', emphasized: true }];

		const [framed] = applyFraming(segments, {
			capitalizeFirst: true,
			terminalPeriod: false,
		});

		expect(framed?.text).toBe('');
	});

	it('does not mutate the input segments (pure per §7.1/§7.3)', () => {
		const segments: Segment[] = [{ text: LOWERCASE_NAME, emphasized: true }];

		applyFraming(segments, { capitalizeFirst: true, terminalPeriod: true });

		expect(segments[0]?.text).toBe(LOWERCASE_NAME);
	});

	it.each([
		[
			[
				{ text: 'Dayton v. Stewart', emphasized: true },
				{ text: ', 179 N.E.3d 208', emphasized: false },
			],
			', 179 N.E.3d 208.',
		],
		[[{ text: 'already ends here.', emphasized: false }], 'already ends here.'],
	] satisfies [Segment[], string][])(
		'terminal period on the last segment -> %j',
		(segments, expectedLast) => {
			const framed = applyFraming(segments, {
				capitalizeFirst: false,
				terminalPeriod: true,
			});

			expect(framed.at(-1)?.text).toBe(expectedLast);
		},
	);

	it('is a no-op on an empty segment list', () => {
		expect(
			applyFraming([], { capitalizeFirst: true, terminalPeriod: true }),
		).toEqual([]);
	});
});

// r[verify segment.representation]
// r[verify segment.emphasis-is-abstract]
describe('render', () => {
	const segments: Segment[] = [
		{ text: 'Dayton v. Stewart', emphasized: true },
		{ text: ', 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).', emphasized: false },
	];

	it('renders plain text by concatenating segment text, ignoring italics', () => {
		const { plain } = render(segments, { emphasis: 'italic' });

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	it.each([
		['italic', 'i'],
		['underline', 'u'],
	] as const)(
		'wraps emphasized segments in <%s> for emphasis %s',
		(emphasis, tag) => {
			const { html } = render(segments, { emphasis });

			expect(html).toBe(
				`<${tag}>Dayton v. Stewart</${tag}>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).`,
			);
		},
	);

	it('escapes HTML-significant characters in segment text', () => {
		const { html, plain } = render(
			[{ text: 'A & B <Corp> § 1', emphasized: false }],
			{ emphasis: 'italic' },
		);

		expect(html).toBe('A &amp; B &lt;Corp&gt; § 1');
		expect(plain).toBe('A & B <Corp> § 1');
	});

	it('produces empty output for an empty segment list', () => {
		expect(render([], { emphasis: 'italic' })).toEqual({
			html: '',
			plain: '',
		});
	});
});

// render() is the one place freeform, unvalidated user text (party
// names, court, docket, code abbreviation -- §6 explicitly allows any
// of these to hold arbitrary text) reaches output.innerHTML verbatim.
// One hand-picked example above isn't enough to trust that boundary;
// these hold for any input, which is the actual security property that
// matters here.
function unescapeHtml(html: string): string {
	return html
		.replaceAll('&lt;', '<')
		.replaceAll('&gt;', '>')
		.replaceAll('&amp;', '&');
}

describe('render: escaping is safe for any input (property)', () => {
	it('never leaves a raw < or > in the html output', () => {
		assert(
			property(string(), (text) => {
				const { html } = render([{ text, emphasized: false }], {
					emphasis: 'italic',
				});
				expect(html).not.toMatch(/[<>]/u);
			}),
		);
	});

	it('escaping is reversible -- unescaping the html recovers plain', () => {
		assert(
			property(string(), (text) => {
				const { html, plain } = render([{ text, emphasized: false }], {
					emphasis: 'italic',
				});
				expect(unescapeHtml(html)).toBe(plain);
			}),
		);
	});

	it('emphasized segments still only add exactly one <tag> pair', () => {
		assert(
			property(string(), (text) => {
				const { html } = render([{ text, emphasized: true }], {
					emphasis: 'italic',
				});
				// Exactly the wrapper's own <i> and </i> -- nothing from text
				// escapes into forming a third tag boundary.
				expect(html.match(/<\/?i>/gu)).toHaveLength(2);
				expect(html.replaceAll(/<\/?i>/gu, '')).not.toMatch(/[<>]/u);
			}),
		);
	});
});
