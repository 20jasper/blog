import { parseBaseFontPx } from './font-size';

// Passed directly into each chart's `tickLabels.fontSize`/`axis.label.fontSize`
// so painting and the library's internal margin math read the same number.
// Reads the live document, so import this only from client-side code; the
// parsing itself is in font-size.ts.
const rootStyle = getComputedStyle(document.documentElement);
export const BASE_FONT_PX = parseBaseFontPx(
	rootStyle.fontSize,
	rootStyle.getPropertyValue('--text-base'),
);
