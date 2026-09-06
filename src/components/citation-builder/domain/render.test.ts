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
		const segments: Segment[] = [{ text: LOWERCASE_NAME, italic: true }];

		const [framed] = applyFraming(segments, {
			capitalizeFirst,
			terminalPeriod: false,
		});

		expect(framed?.text).toBe(expected);
	});

	it('leaves an empty first-segment text untouched rather than throwing', () => {
		const segments: Segment[] = [{ text: '', italic: true }];

		const [framed] = applyFraming(segments, {
			capitalizeFirst: true,
			terminalPeriod: false,
		});

		expect(framed?.text).toBe('');
	});

	it('does not mutate the input segments (pure per §7.1/§7.3)', () => {
		const segments: Segment[] = [{ text: LOWERCASE_NAME, italic: true }];

		applyFraming(segments, { capitalizeFirst: true, terminalPeriod: true });

		expect(segments[0]?.text).toBe(LOWERCASE_NAME);
	});

	it.each([
		[
			[
				{ text: 'Dayton v. Stewart', italic: true },
				{ text: ', 179 N.E.3d 208', italic: false },
			],
			', 179 N.E.3d 208.',
		],
		[[{ text: 'already ends here.', italic: false }], 'already ends here.'],
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
describe('render', () => {
	const segments: Segment[] = [
		{ text: 'Dayton v. Stewart', italic: true },
		{ text: ', 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).', italic: false },
	];

	it('renders plain text by concatenating segment text, ignoring italics', () => {
		const { plain } = render(segments, { typeface: 'italic' });

		expect(plain).toBe(
			'Dayton v. Stewart, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		);
	});

	it.each([
		['italic', 'i'],
		['underline', 'u'],
	] as const)(
		'wraps italic segments in <%s> for typeface %s',
		(typeface, tag) => {
			const { html } = render(segments, { typeface });

			expect(html).toBe(
				`<${tag}>Dayton v. Stewart</${tag}>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).`,
			);
		},
	);

	it('escapes HTML-significant characters in segment text', () => {
		const { html, plain } = render(
			[{ text: 'A & B <Corp> § 1', italic: false }],
			{ typeface: 'italic' },
		);

		expect(html).toBe('A &amp; B &lt;Corp&gt; § 1');
		expect(plain).toBe('A & B <Corp> § 1');
	});

	it('produces empty output for an empty segment list', () => {
		expect(render([], { typeface: 'italic' })).toEqual({
			html: '',
			plain: '',
		});
	});
});
