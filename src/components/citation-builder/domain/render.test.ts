import { describe, expect, it } from 'vitest';
import { applyFraming, render } from './render';
import type { Segment } from './types';

describe('applyFraming', () => {
	const lowercaseName = 'dayton v. stewart';

	it.each([
		[true, 'Dayton v. stewart'],
		[false, 'dayton v. stewart'],
	])('capitalizeFirst: %s -> %j', (capitalizeFirst, expected) => {
		const segments: Segment[] = [{ text: lowercaseName, emphasized: true }];

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
		const segments: Segment[] = [{ text: lowercaseName, emphasized: true }];

		applyFraming(segments, { capitalizeFirst: true, terminalPeriod: true });

		expect(segments[0]?.text).toBe(lowercaseName);
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
		[
			'italic',
			'<i>Dayton v. Stewart</i>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		],
		[
			'underline',
			'<u>Dayton v. Stewart</u>, 179 N.E.3d 208, 214 (Ohio Ct. App. 2021).',
		],
	] as const)(
		'wraps emphasized segments for emphasis %s',
		(emphasis, expected) => {
			const { html } = render(segments, { emphasis });

			expect(html).toBe(expected);
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
