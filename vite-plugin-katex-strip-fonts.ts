import type { Plugin } from 'vite';

/**
 * katex.min.css bundles its own @font-face rules for all 60 font files
 * (woff2+woff+ttf per font); those are dropped here so importing the file
 * normally (as a real, separately-cacheable stylesheet via `?url`) doesn't
 * pull them in. katex-fonts.css supplies the actual @font-face rules this
 * site uses, imported and served alongside it.
 *
 * Vite also runs a small JS wrapper module through this same `id` when
 * resolving the `?url` import (something like
 * `export default "__VITE_CSS_URL__..."`), which isn't CSS at all -- guard
 * on actual @font-face content, not just the id, or this corrupts that
 * wrapper into invalid JS.
 */
export function katexStripFonts(): Plugin {
	return {
		name: 'katex-strip-fonts',
		enforce: 'pre',
		transform(code, id) {
			if (!id.includes('katex.min.css') || !code.includes('@font-face')) {
				return null;
			}

			return code.replaceAll(/@font-face\{[^}]*\}/gu, '');
		},
	};
}
