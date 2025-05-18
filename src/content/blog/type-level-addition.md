---
title: 'TypeScript Type Level Addition'
pubDate: '2025-05-17'
description: 'Metaprogramming and type level shennanigans'
math: true
---

This blog is adapted from the slide deck for my Columbus Code and Coffee talk. [Watch the talk version](https://www.youtube.com/watch?v=DjcC6p_8fpE)
if you prefer videos!

Ok, now let's get into it!

## No JavaScript Allowed

We'll work entirely on the type level—there will be no runtime representation

```ts
// absolutely not
const add = (x: number, y: number): number => x + y;
```

```ts
// amazing
type Result = Add<1, 2> = ...;
//   ^? Result: 3
```

Note that the syntax `// ^?` is a twoslash, which shows what each type resolves to

## Why?

We'll use practical pieces to build something impractical—I'll show just how impractical at the end!

It's great to get a better handle on the TypeScript type system or push the boundaries if you're a big nerd like me

Plus it's fun—stop judging me 😡

## Who's this talk for?

To fully understand, you'd need to have doven deep into TypeScript metaprogramming, maybe writing a library or doing type challenges for the sake of it. Don't fret if you're not a pro!

## Agenda

These are the building blocks we'll need to eventually build up to type level addition

It's tough to find more information without the correct terminology. If you look up "how to find the last item of a TypeScript array type," you'll only find runtime examples like `arr.at(-1)` and `arr[arr.length - 1]`. If you write "how to find the last item of a TypeScript tuple type," you'll get the type version!

- generics/generic constraints
- conditionals
- mapped types
- variadic tuple types
- infer
- recursion
- Addition—the main event!

## Generics

Generics are type level parameters—we can derive one type from another. In this case, they stop us from needing to create a new type and function for every item that could be held in an array. Instead of `StringArray`, `NumberArray` and `NumberAndStringArray`, we can have an `Array<T>` where `T` is any type

JavaScript arrays don't care about the implementation of their items, so there's no need to reimplement `pop` or `push` for each element type

```ts
type MyArray<T> = {
	push: (x: T) => void;
	pop: () => T | undefined;
	map: <U>(fn: (x: T) => U) => MyArray<U>;
};
type SlushyMaker<Flavor> = {
	makeSlushy: (flavor: Flavor) => Slushy<Flavor>;
};
```

## Why do we care about types?

Types are used when we care about some property of the input. In this case, we want to add two numbers as opposed to string concatenating for example

```ts
const add = (x: number, y: number): number => x + y;
```

## Generic Constraints

This same concept applies on the type level—for example, we may care that a type has a length property or is indexable by a string

`SlushyFlavor` is a sum type, meaning it can be one of `"Lemonade"`, `"Orange Fanta"` or so on.

```ts
type SlushyFlavor =
	| 'Lemonade'
	| 'Orange Fanta'
	| 'Mountain Dew'
	| 'Motor Oil'
	| 'Peach';
```

`extends` requires that the left type must be assignable to the right. `"beans"` is not assignable to `SlushyFlavor`, so the consumer of our API gets feedback through a type error

```ts
type SlushyMaker<Flavor extends SlushyFlavor> = {
	makeSlushy: (flavor: Flavor) => Slushy<Flavor>;
};

// Type '"beans"' does not satisfy the constraint 'SlushyFlavor'
type BeansSlushyMaker = SlushyMaker<'beans'>;
```

## Conditionals

There is no if statement on the type level—conditionals are done via ternary expressions. However, instead of operating on a boolean expression, they check if a type is assignable to another—just like generic constraints

```ts
type SlushyFlavor =
	| 'Lemonade'
	| 'Orange Fanta'
	| 'Mountain Dew'
	| 'Motor Oil'
	| 'Peach';

type IsDelicious<T extends SlushyFlavor> = T extends 'Peach' ? false : true;
```

## Exercise 1 - And

Pay attention to all these examples—we'll be using them in our final result!

<details>
<summary>
Code a type <code>And</code> that takes in two booleans and returns <code>true</code> if both are <code>true</code> and <code>false</code> otherwise
</summary>

If `T` and `U` are both the literal `true`, then `true` will be returned

```ts
export type And<T extends boolean, U extends boolean> = T extends true
	? U extends true
		? true
		: false
	: false;
```

Remember that `extends` means `T` must be assignable to `boolean`, so `boolean`, `true`, `false`, or `never`[^neverUnion] will be valid here, though we'll pass only the literals `true` and `false` in our case

[^neverUnion]: `never` is a part of every union. For example, `string` is technically `string` | `never`

</details>

## Mapped Types

Mapped types allow us to loop through object keys and change their values. Similar to JavaScript, tuples types act as objects with numeric keys, so they can be mapped equivalently

```ts
type Cheesify<T> = {
	[Key in keyof T]: 'cheese 🧀🧀🧀';
};

type CheesifiedObject = Cheesify<{
	favoriteFood: 'waffles';
	favoriteChild: 'Charlie';
}>;
//    ^? {favoriteFood: "cheese 🧀🧀🧀"; favoriteChild: "cheese 🧀🧀🧀";}
type CheesifiedTuple = Cheesify<[1, 2]>;
//     ^? ["cheese 🧀🧀🧀", "cheese 🧀🧀🧀"]
```

## Variadic Tuple Types

Variadic tuples are very similar to the spread operator in JavaScript (`...`). For example, we can take two tuples and concatenate them like so

```ts
type Concat<T extends unknown[], U extends unknown[]> = [...T, ...U];
type Delicious = Concat<['garlic'], ['bread', 'is', 'scrumptious']>;
//   ^? ["garlic", "bread", "is", "scrumptious"]
```

The generic constraint is required to let TypeScript know we can spread this type

## Infer

In conditional types, we can extract types with `infer`. `infer` is only usable in a conditional—the `false` branch returning `never` is unreachable since `T` is constrained to arrays

```ts
type Element<T extends unknown[]> = T extends Array<infer Item> ? Item : never;

type Num = Element<number[]>;
//   ^? number
```

`infer` has a _lot_ of use cases beyond this, and we'll explore a few more in this article!

## Last

Combining variadic tuple types and `infer`, we can grab the last item in a tuple

The default of `0` will come in handy later!

```ts
export type Last<T extends unknown[], Default = 0> = T extends [
	...infer _,
	infer L,
]
	? L
	: Default;
type LastExample = Last<[1, 2, 3, 4]>;
//   ^? 4
type LastExampleEmpty = Last<[], 42>;
//   ^? 42
```

`infer` can also get the last character in a string as well, albeit with different syntax

## Exercise 2 - Pop

<details>

<summary>Make a type taking in a tuple and returning a copy without the last element</summary>

This is almost exactly the same as our `Last` example, but we keep the starting elements

```ts
export type Pop<T extends unknown[]> = T extends [...infer Head, infer _]
	? Head
	: [];
type PopExample = Pop<[1, 2, 3, 4]>;
//   ^? [1, 2, 3]
type PopExampleEmpty = Pop<[]>;
//   ^? []
```

</details>

## Adding time!

Make a type that takes in two numbers and returns their sum

### Adding Small Numbers

This could be done with an addition table. `Table[1][1]` would give us `2`

```ts
type Table = [
  [0, 1, ...],
  [1, 2, ...],
  ...
]
```

For our implementation, we'll instead use the `length` property on tuples

We can make two tuples and combine them together and get the new length at the end!

<details>
<summary>Tuple of length <code>N</code></summary>

We must use recursion to loop `N` times since there is no native looping construct like a `for` or `while` loop in the type system.

If the length of the resultant tuple is `N`, then stop recursing. If not, add an arbitrary value to the tuple, in this case `never`.

```ts
type TupleLengthN<
	N extends number,
	T extends never[] = [],
> = N extends T['length'] ? T : TupleLengthN<N, [...T, never]>;
```

</details>

<details>
<summary>Add digits</summary>

Now that we can create tuples of arbitrary length, we can concatenate them and grab the new length

```ts
export type AddDigits<M extends number, N extends number> = [
	...TupleLengthN<M>,
	...TupleLengthN<N>,
]['length'] &
	number;
```

There is a limitation of 999 items per tuple with this method before hitting the recursion limit, so we'll need to find another approach. We likely could manually make a huge addition table, but that's no fun!

</details>

### Manual Adding

Since we can't add numbers larger than 999, we need to take matters into our own hands and go back to grade school. I'm sorry to say, but in addition to programming fundamentals, we need to know how to do basic arithmetic as well

We need to add left to right. If the sum of a column is greater than 10, we carry the 10s place and leave the 1s place behind

```math
\begin{array}{cc}
     & 1 & 5  \\
   + &   & 6  \\
   \hline
     & ? & ?
\end{array}
```

To add 15 and 6. First, we add 5 and 6

This adds to 11, so we take the 1 from the tens place and carry it over. The 1 from the ones place goes into the resultant ones column

```math
\begin{array}{cc}
     & 1 &    \\
     & 1 & 5  \\
   + &   & 6  \\
   \hline
     &  & 1
\end{array}
```

Finally, we add the carried one and the one from the tens place of 15 to get 2, and put that in the 10s place, giving us 21

```math
\begin{array}{cc}
     & 1 &    \\
     & 1 & 5  \\
   + &   & 6  \\
   \hline
     & 2 & 1
\end{array}
```

#### Pseudocode

To avoid getting bogged down in implementation, let's do some pseudocode with some more familiar syntax

```ts
func add(num1, num2) {
	result = []
	carry = 0
	while carryOrDigitsToAdd {
		sum = lastDigit(num1) + lastDigit(num2) + carry

		digit = sum % 10
		carry = sum / 10

		result.push(digit)
	}
	return toNumber(result)
}
```

### Split into digits

I recommend looking at these implementations one by one—they can be a bit much to look at. You have everything you need to understand them, but the syntax can be overwhelming

<details>
<summary>Convert a number into its individual digits</summary>

We'll see implementation details for `MapNums` and `Split` soon—don't worry about them for now

```ts
export type Digits<T extends NumLike> = MapNums<Split<`${T}`>>;
type DigitsExample = Digits<289>;
//   ^? [2, 8, 9]
```

</details>

<details>
<summary>Split a string into an array of its characters</summary>

This is very similar to splitting up our tuples, but with some new syntax to handle strings!

```ts
export type Split<S extends string> = S extends `${infer Head}${infer Rest}`
	? [Head, ...Split<Rest>]
	: [];
type SplitExample = Split<'123'>;
// ^? ["1", "2", "3"]
```

</details>

<details>
<summary>Map an array of strings to their numeric equivalents</summary>

```ts
export type MapNums<T extends string[]> = {
	[K in keyof T]: ToNumber<T[K]>;
};
type MapNumsExample = MapNums<['1', '2', '3']>;
//   ^? [1, 2, 3]
```

</details>

### Carries

There's no remainder or division operator in the Type Level!

We can assume numbers are never greater than two digits for these implementations

<details>
<summary>Get first digit of a number</summary>

```ts
export type GetCarry<T extends number> =
	`${T}` extends `${infer C}${infer _}${infer _}` ? ToNumber<C> : 0;
type GetCarryExample1 = GetCarry<12>;
//    ^? 1
```

</details>

<details>
<summary>Get last digit of a number</summary>
This could be implemented similarly to <code>GetCarry</code>, but this is pretty elegant, so why not!

```ts
export type GetDigit<T extends number> = ToNumber<Last<Split<`${T}`>>>;
type GetDigitExample1 = GetDigit<12>;
//   ^? 2
```

</details>

### Looping

Remember, there's no for loop in the type level, we must use recursion

The base case is when there are no more numbers to add

```ts
And<
  And<IsZero<Num1["length"]>, IsZero<Num2["length"]>>,
  IsZero<Carry>
> extends true
```

This following is the most complex the code will get—take some time to understand what it's doing

<details>
<summary>Recursive Adder Implementation</summary>

`Sum` is set as a default to mimic a variable in JavaScript—it could be directly in the code, but it looks nicer this way

If there's no more numbers to add, end. If there are, add the ones place to the resultant tuple and continue on with the carry and pop from the 2 num arrays

```ts
type Adder<
	Num1 extends number[],
	Num2 extends number[],
	Carry extends 0 | 1 = 0,
	Sum extends number = AddDigits<Carry, AddDigits<Last<Num1>, Last<Num2>>>,
> =
	And<
		And<IsZero<Num1['length']>, IsZero<Num2['length']>>,
		IsZero<Carry>
	> extends true
		? []
		: [...Adder<Pop<Num1>, Pop<Num2>, GetCarry<Sum>>, GetDigit<Sum>];
type AdderExample = Adder<[9, 2, 3, 4], [5, 4, 3, 2]>;
//   ^? [1, 4, 6, 6, 6]
```

Got it? I understand if not, this is a lot to get through 😅

</details>

### Joining the result

This calls `Adder` and converts the array of digits into a single number!

Since we're stringifying, we can take in a `string | number | BigInt` with no issue. Let's call that a `NumLike`

```ts
export type Add<M extends NumLike, N extends NumLike> =
	Adder<Digits<M>, Digits<N>> extends infer R extends number[]
		? ToNumber<Join<R>>
		: never;
```

You may see a wacky `extends infer R extends number[]` in there, this is done to get around the recursion/type instantiation depth limit

With this, you can add numbers up until 64 bit floating point numbers can accurately describe them!
Maybe if we used `BigInt`s we could go even further!

### Let's take a look at the code!

[Take a look through the GitHub Repo](https://github.com/20jasper/type-level-addition) if you're so inclined!

[Play around with the code in a TypeScript Playground](https://www.typescriptlang.org/play/?#code/KYDwDg9gTgLgBDAnmYcAqEByBXAtgI2CgB4BlOUGYAOwBMBnOemKAS2oHMA+OAXjnKUaDOAAMAJAG92AMyJxMFEFTqNqeQlAC+ogLAAoOHAD8Cg0YBccasABuRANwGkKdFg1EAoiACGuMAA2qPwYOARExABEAIwATADMkVxO+gD0qUZwAHrGBgagkLAIyKgAMj7MxGhKKiLY1ADW1BAA7tQA2gC6ADRwACLAMj7YAfD8AAw8ITXCjO3mcAB0y7LyAPrdC6tQcKUGnQume4ZwVgNDIzApLmUVMN5+gcG7d8Tt0b2xvfG9ACydyQM6UyOWcJRezAe-iCnn8SD4EJgbx6cF+sUBaQyRlB+ny4Gg8BucAAChAwFUZqo4PUmq0OgCEdUhFT2stFts4AAJYA+Wi9DlrA4nUzc3kLKxda7g0lgKFPBEyt4fOBfOA-VEAlLA7G5fREmVymFwxAKsnIjHa7K6vGFQnggCyPjAYXoFOZImYbE4XSmcEkC3aAGk4Ow4A1gIgIDJ0J0rKEPCQ0EHNQYtFLXI7nXh6IbnpmXW8YpFepFYsW4JFEinMSDrfoCgTiq5SIFWEjBMpZkwWOxuAiO7VGBJpNQ5DtRbQtFIOQAlYDMHSHODtCe9NktgJt4hz5hcIWWZeddOoDdt3P91tImIJX4AViSWqxVrBzcvudhYHh-FPV4fQKfOI2o2RIAFIQOwbqdlS6jhFAPqMpSIjzCcHITohagJpsJxsrO87wO6GGwV0+xLsOE5TpIYEQTuMBcIuJxWJEkTHnAVHUOe-BsUqnzfH81aWoB9b4kURIAIJ0JBg5wPgEAQEEPjUL0ACq6HSbJ8nUL6TJQSILDYMAS4qQRCBQPpCxGKYekGScB5DAE9DWbZPj2cALHibQuZoKZzzucQVm9FZFoAbqYl0LmABizkOQivn+XAdkOUFtYvqg7m5gAQhAMAABaRS5MUSQlwC9EVSU6nkQm2k2qBhKUrDhgiMGaHAAA+0msBw7DwG1nq9ikQEieCfQdW2rraVJtX1cAvr5tmZCXsQw5oDoXAYkSw2dTAOa+NCzwbaNxCxAAHAAnPEx1lc+epDSNW25qQPacAi+1bVEcTxHef41uV12uC922PEE6UdQAktQYz9LdrrvXeABsADsp2aY+yW4r9qBoNgTylDQHA5ZgxALIoxlNUQWFGONXY2PYcGdAixH6L6xM6YwSaREEnA5ZEdOmNUcZY0EOOc9lBOYL0rLLGgvTU0Q1YDXariibQtD-cQ9qqaTUC9MzUma76yFGGymPY7j+Nq1w5NLJLAvAELeMi8QmBcPs7Ts6b2Xc3AABkCya25yv-RxcBKyrUPECdEe9BHkwo5kV3y9VcAAOLADAADCPhQFAiCSVTCZTAsS06Kpw4cmnFEChXo7rMXvPuLBxBpzwVjjCxKfp5n2e5tECLtxnWc53El04kSfed4guaxL3qf99n4fD3WDaDa47cvbn0H54y9eaMQ5SVD+i1SMtoirWt4Kr7d3fTzAa9D7HV2j6nL2T9fa8nQvFVEiD9AAFpEBA68RB6wQsZcYJgTL6VOPFKKrlP7ghDhEImeAe4kwTF0S2YQp6oKIj0BYs8TSgNanAHuExLakDwBrBMMUA5h3wb0EOqs95IjCNEC2iJHZ4HRKtAwvpfILF8t-P+UAAEsNdhze23M2GCP-hw3AsQxHu0kRbBY0jhGN3Hs7RmqkrJLgZgeCWiwEEkEVCwthJjOFsLHgPMgeBVq9AvptGxuA9z+1oF4Ha8p+BGLeCdHiao+Li1vH8XiKp+LBQqkvBWqVlZq1UpNcM2s4l4DquGXhytEEnFVvaZRmSw5Ox4apWclCcFLnjA3LiM5uEMWsHYRwcDFbKyvl4mJN4Ei+JVB9BI4xum-Eug-eBjSPFBCns02g4deh33-HHEeAyPJDOAPEahYzo6KQrHEL6lorRAA)

## But could you actually use this in a codebase?

Yes, but should you? It only works well if you know the literal type

You can either know the type at compile time

```ts
const add = <T extends number, U extends number>(x: T, y: U) =>
	(x + y) as Add<T, U>;

add(5, 10);
// ^? const add: <5, 10>(x: 5, y: 10) => 15
```

Or you can do some ridiculous assertions. If you were so inclined, you could assert on every number, albeit with a huge file size and runtime impact. I see the value in unsigned integers, but this level of precision is probably not worth it

```ts
let num: number = 10;
//   ^? let num: number
if (num === 10) {
	num;
	// ^? 10
}
```

---

I started down this rabbithole after being challenged to do a CodeWars on the same topic. I said it couldn't be _that_ hard. It ended up taking me 4 hours 😅

CodeWars uses an older version of TypeScript with a lower recursion limit, so I had to do more shenanigans to get it working

For reference, I've read the [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) and have been doing similar code challenges including from the [TypeScript Type Challenges](https://github.com/type-challenges/type-challenges) repo, advent of TypeScript, and so on for a few years now

My first blog from 2 years and 4 months ago—[Implement `Pick` in TypeScript](https://jacobasper.com/blog//implement-pick-in-typescript/)—was on the same topic!

Thanks for coming along this journey with me, and hopefully I'll see you soon!
