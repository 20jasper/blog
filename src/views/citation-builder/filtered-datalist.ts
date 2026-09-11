import * as z from 'zod/mini';
import type { Option } from './components/option';

const MAX_RESULTS = 25;
const DEBOUNCE_MS = 120;

const optionsSchema = z.array(
	z.object({ value: z.string(), text: z.string() }),
);

function debounce(fn: () => void, delayMs: number): () => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;
	return () => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(fn, delayMs);
	};
}

function readOptions(datalistId: string): Option[] {
	const source = document.querySelector(
		`#${CSS.escape(`${datalistId}-source`)}`,
	);
	if (source?.textContent === null || source?.textContent === undefined) {
		return [];
	}
	const parsed: unknown = JSON.parse(source.textContent);
	const result = optionsSchema.safeParse(parsed);
	return result.success ? result.data : [];
}

function matches(option: Option, query: string): boolean {
	return (
		option.value.toLowerCase().includes(query) ||
		option.text.toLowerCase().includes(query)
	);
}

export function setupFilteredDatalists(form: HTMLFormElement): void {
	const inputs = form.querySelectorAll<HTMLInputElement>(
		'input[data-datalist-source]',
	);
	for (const input of inputs) {
		const datalistId = input.dataset.datalistSource;
		const datalistEl = document.querySelector(
			`#${CSS.escape(datalistId ?? '')}`,
		);
		if (
			datalistId === undefined ||
			!(datalistEl instanceof HTMLDataListElement)
		) {
			continue;
		}
		const options = readOptions(datalistId);

		const render = debounce(() => {
			const query = input.value.trim().toLowerCase();
			const results =
				query === ''
					? []
					: options
							.filter((option) => matches(option, query))
							.slice(0, MAX_RESULTS);
			datalistEl.replaceChildren(
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
