import { describe, expect, it } from 'vitest';
import { createStore } from './store';

describe('createStore', () => {
	it('getState returns the initial state', () => {
		const store = createStore({ count: 0 });

		expect(store.getState()).toEqual({ count: 0 });
	});

	it('setState with a direct value replaces state', () => {
		const store = createStore({ count: 0 });

		store.setState({ count: 5 });

		expect(store.getState()).toEqual({ count: 5 });
	});

	it('setState with an updater function derives from the previous state', () => {
		const store = createStore({ count: 5 });

		store.setState((prev) => ({ count: prev.count + 1 }));

		expect(store.getState()).toEqual({ count: 6 });
	});

	it('subscribe notifies listeners when setState is called', () => {
		const store = createStore({ count: 0 });
		let notifications = 0;
		store.subscribe(() => {
			notifications += 1;
		});

		store.setState({ count: 1 });

		expect(notifications).toBe(1);
	});

	it('the function returned by subscribe unsubscribes that listener', () => {
		const store = createStore({ count: 0 });
		let notifications = 0;
		const unsubscribe = store.subscribe(() => {
			notifications += 1;
		});

		unsubscribe();
		store.setState({ count: 1 });

		expect(notifications).toBe(0);
	});
});
