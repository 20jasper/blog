/**
 *
 * @param fn the function to be cached. It should take an argument comparable by `===`. If it was last called with the same argument, then it will return the cached value
 * @returns the cached value or a newly sourced value
 */
export const cache = <T, U>(fn: (x: U) => T): ((x: U) => T) => {
	let res: undefined | T;
	let lastArgs: undefined | U;

	return (y: U) => {
		if (res === undefined || lastArgs !== y) res = fn(y);
		return res;
	};
};
