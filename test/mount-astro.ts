import { commands } from 'vitest/browser';

type RenderOptions = {
	props?: Record<string, unknown>;
	slots?: Record<string, string>;
};

declare module 'vitest/browser' {
	// Declaration merging only works on an interface, not a type alias.
	// oxlint-disable-next-line consistent-type-definitions
	interface BrowserCommands {
		renderAstro: (
			componentPath: string,
			options?: RenderOptions,
		) => Promise<string>;
	}
}

// Mounts a real .astro component into the test page: its server-rendered HTML
// (via the renderAstro command), then the client scripts Astro would have
// shipped with it. Nothing about the component's markup is written by hand.
export async function mountAstro(
	componentPath: string,
	options: RenderOptions = {},
	into: HTMLElement = document.body,
) {
	const html = await commands.renderAstro(componentPath, options);

	const page = document.createElement('template');
	page.innerHTML = html;
	// Scripts inserted via innerHTML never run, so lift them out and import
	// them ourselves from the dev server instead.
	const scripts = [
		...page.content.querySelectorAll<HTMLScriptElement>(
			'script[type="module"][src]',
		),
	];
	const urls = scripts.map((script) => `/@fs${script.getAttribute('src')}`);
	for (const script of scripts) {
		script.remove();
	}

	into.append(page.content);
	// The comment has to sit inside the call: it tells Vite not to analyze it.
	// oxlint-disable-next-line no-inline-comments
	await Promise.all(urls.map((url) => import(/* @vite-ignore */ url)));
}
