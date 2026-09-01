import katexCssRaw from 'katex/dist/katex.min.css?raw';
import katexFonts from '@src/styles/katex-fonts.css?inline';

// remove 60 default fonts and add 20 targeted fonts
export const katexStyles =
	katexCssRaw.replaceAll(/@font-face\{[^}]*\}/gu, '') + katexFonts;
