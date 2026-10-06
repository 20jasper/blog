// Same approach as https://github.com/ascorbic/vitest-browser-astro
import { afterEach } from 'vitest';
import { commands, utils } from 'vitest/browser';
import type { RenderOptions } from './astro-renderer';

declare module 'vitest/browser' {
	// oxlint-disable-next-line consistent-type-definitions
	interface BrowserCommands {
		renderAstro: (
			componentPath: string,
			options?: RenderOptions,
		) => Promise<string>;
	}
}

const mounted = new Set<HTMLElement>();

afterEach(() => {
	for (const container of mounted) {
		container.remove();
	}
	mounted.clear();
});

function loaded(script: HTMLScriptElement) {
	return new Promise<void>((resolve, reject) => {
		script.addEventListener('load', () => {
			resolve();
		});
		script.addEventListener('error', reject);
	});
}

export async function render(component: object, options: RenderOptions = {}) {
	if (!('astroFile' in component) || typeof component.astroFile !== 'string') {
		throw new Error(
			'Not an Astro component: is astroComponentStubs() configured?',
		);
	}
	const html = await commands.renderAstro(component.astroFile, options);

	const container = document.body.appendChild(document.createElement('div'));
	mounted.add(container);

	const template = document.createElement('template');
	template.innerHTML = html;
	const scripts = [...template.content.querySelectorAll('script[src]')].map(
		(original) => {
			original.remove();
			const script = document.createElement('script');
			script.type = original.getAttribute('type') ?? '';
			script.src = original.getAttribute('src') ?? '';
			return script;
		},
	);
	container.append(template.content, ...scripts);
	await Promise.all(scripts.map(loaded));

	return {
		element: () => container,
		...utils.getElementLocatorSelectors(container),
	};
}
