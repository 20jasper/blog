// Pure half of BASE_FONT_PX (see chart-utils.ts): turns the root element's
// computed font-size ("16px") and Tailwind's `--text-base` token ("1rem")
// into a px number.
//
// `--text-base` is Tailwind's own token. `getPropertyValue` returns its raw
// authored string, not a computed px value the way real CSS properties do --
// rem is the only unit Tailwind's type scale ever authors it in, so parse the
// number out and scale it by the root's own computed font-size (which already
// reflects the browser/user's real zoom and font-size preferences). If
// `--text-base` is ever redefined in a unit other than rem, this needs a
// second branch to match.
export function parseBaseFontPx(rootFontSize: string, textBaseToken: string) {
	// parseFloat, not Number() -- both "16px" and "1rem" carry a trailing unit,
	// which Number() would reject outright (NaN) instead of reading the leading
	// digits.
	// oxlint-disable-next-line prefer-number-coercion
	const rootPx = parseFloat(rootFontSize);
	const token = textBaseToken.trim();
	// oxlint-disable-next-line prefer-number-coercion
	const rem = parseFloat(token);
	return token.endsWith('rem') && !Number.isNaN(rem) ? rem * rootPx : rootPx;
}
