import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { BrowserCommand } from 'vitest/node';

// Runs in Node, next to the Vite dev server that already compiles .astro files
// for this project. The browser test gets back the component's real HTML, so
// it never hand-writes markup that could drift from the template.
export const renderAstro: BrowserCommand<
	[
		path: string,
		options?: {
			props?: Record<string, unknown>;
			slots?: Record<string, string>;
		},
	]
> = async (ctx, path, options = {}) => {
	const { default: component } = await ctx.project.vite.ssrLoadModule(path);
	const container = await AstroContainer.create();
	// ssrLoadModule is untyped; the default export of an .astro file is its
	// component factory.
	// oxlint-disable-next-line no-unsafe-argument
	return container.renderToString(component, options);
};
