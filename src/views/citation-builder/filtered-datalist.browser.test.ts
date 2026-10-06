import { afterEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mountAstro } from '../../../test/mount-astro';
import { MAX_RESULTS } from './filtered-datalist';
import type { Option } from './components/option';

async function mountField(options: Option[]) {
	await mountAstro(
		'/src/views/citation-builder/components/filtered-datalist.astro',
		{
			props: { id: 'courts', options },
			slots: { default: '<input aria-label="court" list="courts" />' },
		},
	);
	const input = document.querySelector('input')!;
	const datalist = document.querySelector('datalist')!;
	const shown = () => [...datalist.options].map((option) => option.textContent);
	return { input, shown };
}

describe('filtered-datalist component', () => {
	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('lists nothing until something is typed', async () => {
		const { shown } = await mountField([{ value: 'a', text: 'Alpha' }]);

		expect(shown()).toEqual([]);
	});

	it('shows only options matching what was typed, by value or text, ignoring case', async () => {
		const { input, shown } = await mountField([
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
		const { input, shown } = await mountField([
			{ value: 'D. Mass.', text: 'District of Massachusetts' },
			{ value: 'D. Me.', text: 'District of Maine' },
		]);

		await userEvent.type(input, 'district of mai');

		await expect.poll(shown).toEqual(['District of Maine']);
	});

	it(`shows at most ${MAX_RESULTS} options so a short query cannot flood the list`, async () => {
		const many = Array.from({ length: MAX_RESULTS + 10 }, (_, i) => ({
			value: `court-${i}`,
			text: `Court ${i}`,
		}));
		const { input, shown } = await mountField(many);

		await userEvent.type(input, 'court');

		await expect.poll(() => shown().length).toBe(MAX_RESULTS);
	});
});
