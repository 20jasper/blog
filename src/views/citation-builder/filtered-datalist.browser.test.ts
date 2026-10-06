import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from '../../../test/render';
import FilteredDatalist from './components/filtered-datalist.astro';
import { MAX_RESULTS } from './filtered-datalist';
import type { Option } from './components/option';

async function renderField(options: Option[]) {
	const screen = await render(FilteredDatalist, {
		props: { id: 'courts', options },
		slots: { default: '<input aria-label="court" list="courts" />' },
	});
	const shown = () =>
		[...screen.element().querySelectorAll('datalist option')].map(
			(option) => option.textContent,
		);
	return {
		screen,
		input: screen.getByRole('combobox', { name: 'court' }),
		shown,
	};
}

describe('filtered-datalist', () => {
	it('lists nothing until something is typed', async () => {
		const { shown } = await renderField([{ value: 'a', text: 'Alpha' }]);

		expect(shown()).toEqual([]);
	});

	it('shows only options matching what was typed, by value or text, ignoring case', async () => {
		const { input, shown } = await renderField([
			{ value: 'D. Mass.', text: 'District of Massachusetts' },
			{ value: 'D. Me.', text: 'District of Maine' },
			{ value: '1st Cir.', text: 'First Circuit' },
		]);

		await userEvent.type(input, 'DISTRICT');

		await expect
			.poll(shown)
			.toEqual(['District of Massachusetts', 'District of Maine']);
	});

	it('narrows the list as more is typed', async () => {
		const { input, shown } = await renderField([
			{ value: 'D. Mass.', text: 'District of Massachusetts' },
			{ value: 'D. Me.', text: 'District of Maine' },
		]);

		await userEvent.type(input, 'district of mai');

		await expect.poll(shown).toEqual(['District of Maine']);
	});

	it(`shows at most ${MAX_RESULTS} options`, async () => {
		const { input, shown } = await renderField(
			Array.from({ length: MAX_RESULTS + 10 }, (_, i) => ({
				value: `court-${i}`,
				text: `Court ${i}`,
			})),
		);

		await userEvent.type(input, 'court');

		await expect.poll(() => shown().length).toBe(MAX_RESULTS);
	});
});
