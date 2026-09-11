import { array, object, string } from 'zod/mini';
import type { Option } from './components/option';

export const MAX_RESULTS = 25;
export const DEBOUNCE_MS = 120;
export const TAG_NAME = 'filtered-datalist';

const optionsSchema = array(object({ value: string(), text: string() }));

export function debounce(fn: () => void, delayMs: number): () => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	return () => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(fn, delayMs);
	};
}

function matches(option: Option, query: string): boolean {
	return (
		option.value.toLowerCase().includes(query) ||
		option.text.toLowerCase().includes(query)
	);
}

export function filterOptions(
	options: Option[],
	query: string,
	maxResults: number,
): Option[] {
	const trimmed = query.trim().toLowerCase();
	if (trimmed === '') {
		return [];
	}
	return options
		.filter((option) => matches(option, trimmed))
		.slice(0, maxResults);
}

export function parseOptions(json: string): Option[] {
	const parsed: unknown = JSON.parse(json);
	const result = optionsSchema.safeParse(parsed);
	return result.success ? result.data : [];
}

export function defineFilteredDatalist(): void {
	if (customElements.get(TAG_NAME) !== undefined) {
		return;
	}

	class FilteredDatalistElement extends HTMLElement {
		connectedCallback(): void {
			const input = this.querySelector('input');
			const datalist = this.querySelector('datalist');
			const source = this.querySelector('script[type="application/json"]');
			if (
				input === null ||
				datalist === null ||
				source === null ||
				source.textContent === null
			) {
				return;
			}
			const options = parseOptions(source.textContent);

			const render = debounce(() => {
				const results = filterOptions(options, input.value, MAX_RESULTS);
				datalist.replaceChildren(
					...results.map((option) => {
						const el = document.createElement('option');
						el.value = option.value;
						el.textContent = option.text;
						return el;
					}),
				);
			}, DEBOUNCE_MS);

			input.addEventListener('input', render);
		}
	}

	customElements.define(TAG_NAME, FilteredDatalistElement);
}
