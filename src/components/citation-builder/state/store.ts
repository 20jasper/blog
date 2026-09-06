export type Store<T> = {
	getState: () => T;
	setState: (updater: T | ((prev: T) => T)) => void;
	subscribe: (listener: () => void) => () => void;
};

function isUpdaterFunction<T>(
	updater: T | ((prev: T) => T),
): updater is (prev: T) => T {
	return typeof updater === 'function';
}

export function createStore<T>(initialState: T): Store<T> {
	let state = initialState;
	const listeners = new Set<() => void>();

	return {
		getState: () => state,
		setState: (updater) => {
			state = isUpdaterFunction(updater) ? updater(state) : updater;
			for (const listener of listeners) {
				listener();
			}
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		},
	};
}
