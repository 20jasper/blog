import { isAbsolute } from 'node:path';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { Plugin } from 'vitest/config';
import type { BrowserCommand } from 'vitest/node';

export type RenderOptions = {
	props?: Record<string, unknown>;
	slots?: Record<string, string>;
};

export const renderAstro: BrowserCommand<
	[componentPath: string, options?: RenderOptions]
> = async (ctx, componentPath, options = {}) => {
	const { vite } = ctx.project;
	const { default: component } = await vite.ssrLoadModule(componentPath);
	const container = await AstroContainer.create({
		resolve: async (id) => {
			const resolved = await vite.pluginContainer.resolveId(id);
			return resolved && isAbsolute(resolved.id)
				? `/@fs${resolved.id}`
				: `/@id/${id}`;
		},
	});
	// oxlint-disable-next-line no-unsafe-argument
	return container.renderToString(component, options);
};

export function astroComponentStubs(): Plugin {
	return {
		name: 'astro-component-stubs',
		enforce: 'post',
		transform(_code, id, options) {
			if (!id.endsWith('.astro') || options?.ssr === true) {
				return null;
			}
			return `export default { astroFile: ${JSON.stringify(id)} };`;
		},
	};
}
