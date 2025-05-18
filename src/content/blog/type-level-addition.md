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

This will be done entirely on the type level at compile time—there will be no runtime representation

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

- Not useful on its own
- Good to get an understanding of the Type System
- It's fun stop judging me

## Who's this talk for?

To fully understand this, you'd need to have doven deep into TypeScript metaprogramming, maybe writing a library requiring complex types or doing type challenges for the sake of it. This is more of a proof of concept rather than something to be fully understood, so don't fret if you don't fit the above criteria.

Ideally you have the following

- some programming fundamentals
- would be nice to have some experience with a typed language, but not required
- it's expected most won't understand everything! Come along for the ride!

## Agenda

These are the building blocks we'll need to eventually build up to type level addition

I list these here since it's tough to find more information on these without the correct terminology. If you look up "how to find the last item of a TypeScript array type," you'll only find runtime examples like `arr.at(-1)` and `arr[arr.length - 1]`. If you write "how to find the last item of a TypeScript tuple type," you'll get the type level version!

- generics/generic constraints
- conditionals
- mapped types
- variadic tuple types
- infer
- recursion
- Addition—the main event!

## Generics

Generics are type level parameters—we can derive one type from another. In this case, they stop us from needing to create a new type and function for every item that could be held in an array. Instead of `StringArray`, `NumberArray` and `NumberAndStringArray`, we can have an `Array<T>` where `T` is any type

JavaScript arrays don't directly act on the items inside, so there's no need to reimplement `pop` or `push` for each element type

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

## TypeScript input types

Before moving on, why do we care about types in the first place?

They are used when we care about some property of the input. In this case, we want to add two numbers as opposed to concatenating or throwing like if we allowed any type of data

```ts
const add = (x: number, y: number): number => x + y;
```

## Generic Constraints

This same concept applies on the type level, for example, we may care that a type has a length property or indexable by a string

`SlushyFlavor` is a sum type here, meaning it can be one of `"Lemonade"`, `"Orange Fanta"` or so on.

`extends` requires that the left type must be assignable to the right. `"beans"` is not assignable to `SlushyFlavor`, so the consumer of our API gets feedback through a type error

```ts
type SlushyFlavor =
	| 'Lemonade'
	| 'Orange Fanta'
	| 'Mountain Dew'
	| 'Motor Oil'
	| 'Peach';

type SlushyMaker<Flavor extends SlushyFlavor> = {
	makeSlushy: (flavor: Flavor) => Slushy<Flavor>;
};

// Type '"beans"' does not satisfy the constraint 'SlushyFlavor'
type BeansSlushyMaker = SlushyMaker<'beans'>;
```

## Conditionals

There is no if statement on the type level—conditionals are done via ternary expressions. However, instead of taking a boolean expression, they check if a type is assignable to another—just like generic constraints

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

Remember that `extends` means `T` must be assignable to `boolean`, so `boolean`, `true`, `false`, or `never` will be valid here, though we'll pass only the literals `true` and `false` in our case

</details>

## Mapped Types

Mapped types allow us to loop through object keys and change their values. Similar to runtime JavaScript, tuples act as objects with numeric keys, so they can be mapped with the same helper

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

In conditional types, we can extract types with `infer`. `infer` is only usable in a conditional—the `false` branch is unreachable since `T` is constrained to arrays. `never` is an arbitrary value since we need _something_ there

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

<summary>Make a type that takes in a tuple and returns a copy without the last element</summary>

This is almost exactly the same as our `Last` example, but we keep the start of the tuple instead of the end

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

This could be done with an addition table like the following. `Table[1][1]` would give us `2`

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

We need to add left to right, and if the sum of a column is greater than 10, we must carry over the 10s place and leave the 1s place behind

```math
\begin{array}{cc}
     & 1 & 5  \\
   + &   & 6  \\
   \hline
     & ? & ?
\end{array}
```

To add 15 and 6. First, we add 5 and 6

This adds to 11, so we take the 1 from the tens place and carry it over to the next calculation and leave behind the 1 from the ones place

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

I recommend looking at these implementations one by one, they can be a bit much to look at. You have everything you need to understand them, but the syntax can be overwhelming

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

The base case is when no more to add from either number or the carry

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

[Take a look through the GitHub Repo](https://github.com/nvaccess/nvda/issues/17667) if you're so inclined!

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
