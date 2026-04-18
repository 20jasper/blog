---
title: 'Killing a `Cow` made my JSON formatter 30% faster and prettier started it all'
pubDate: '2026-04-20'
description: 'Early optimization is bad'
tags: ['rust', 'performance']
---

Over the past year, I've been building a JSON formatter in Rust called [JJPWRGEM](TODO). I was excited for some friendly competition after hearing oxfmt, a drop in prettier replacement written in Rust, now supports all filetypes prettier does! Most other fast JSON formatters lack complex features such as Prettier's width aware formatting. My formatter, JJPWRGEM, formats 40-75x faster[^cliBenchmarks] than prettier, and I assumed oxfmt would be faster. Reasonably so, oxfmt does not natively implement formatting for all filetypes, delegating to prettier for JSON, making it 10-20% slower than prettier[^respectOxfmt]

[^respectOxfmt]: I love everything oxfmt has done so far, so this is not meant to put down oxmft. It's the only prettier compatible tooling I've found that doesn't crash when formatting larger JSON files and there are some amazing architectural decisions they've made that I am thoroughly impressed with. Open source is a lot of work

This sparked something in me. Could I format JSON just like prettier without sacrificing speed? Prettier normalizes numbers, for example `1E+05` becomes `1e5`. [Specific normalization rules will be explained later in the article](#number-normalization). I sped up my formatter by 30% while normalizing numbers just like prettier, and here's how I did it

[^cliBenchmarks]: TODO link to amazing benchmarks and call out all the caveats like mine does not support

## What's a `Cow` anyways?

For my JSON formatter, I initially aimed for flexibility via data types like Clone On Write (`Cow`) . As the name implies, a `Cow` will only duplicate its data when mutated, which is helpful for operations that may or may not need to mutate data. A `Cow` can own its data or hold a reference

Imagine you have a string to lowercase—if it's already lowercase, you can just return a reference to the same string!

```py
function cow_to_lowercase(string):
    if string.is_lowercase():
        # return reference to same string
        return string
    # make a new string
    return string.clone().to_lowercase()
```

Sounds great right? I anticipated needing to either own or borrow my data, but I could always borrow pieces of the input string and never mutated, so the flexibility was just a small amount of overhead per item that adds up over hundreds of thousands of potential calls. If the `Cow` owns its data, it must clean up, or drop, its data once it goes out of scope

Even worse, JSON has more tokens than just numbers, so it would need to check if there was any cleanup for every token going out of scope. For example, an `OpenCurlyBrace` has no data attached to it, but it must be checked every time a `Token` goes out of scope, which is _a lot_

```rs
pub enum Token<'a> {
      Number(Cow<'a, str>),
      OpenCurlyBrace,
      ClosedCurlyBrace,
      String(&'a str),
      Null,
      // omitted 5 more tokens for brevity
}
```

Changing to the `Number` to hold a reference to a `str` removes around 20% of unnecessary instructions (around 12 million for a 1.7MB file). I'll link a followup deep dive into LLVM IR proving it's not memory layout or branch predictions

## How does a formatter work?

Before I explain what I did, you need to understand how a formatter works

1. convert a string input into an in memory representation (deserialization)
2. output a string according to formatting rules (serialization)

For example, JJPWRGEM converts strings to chunks of text called tokens

<!-- prettier-ignore -->
```json
{"hi hello"    : 10 }
```

```rust
[OpenCurlyBrace, String("hi hello"), Colon, Number("10"), ClosedCurlyBrace]
```

To uglify, or remove unnecessary characters, we can remove any insignificant whitespace like spaces outside of strings or newlines. It's as simple as appending each token's string representation to the output

<!-- prettier-ignore -->
```json
{"hi hello":10}
```

For more complex cases like pretty printing, we can take these tokens and built an abstract syntax tree, or AST, which encodes relationships like nesting and key value pairs. This allows us to navigate the tree or easily know where a matching brace is. Prettier and JJPWRGEM use an abstract syntax tree to quickly calculate how wide an object would be on a single line, and expand it if it's too large

```rust
Object([
	Entry(String("hi hello"), Number("10"))
])
```

## Number normalization

JJPWRGEM currently leaves numbers untouched, while prettier does several exponent transformations[^omittedTransforms]

[^omittedTransforms]: there are more number transformations, but that's for another day!

1. Lowercases exponent symbol (from `1E5` to `1e5`)
2. Strips `+` sign (from `1e+5` to `1e5`)
3. Strips leading zeroes in exponents (from `1e0005` to `1e5`)
4. Removes 0 exponents (from `1e0` to `1`)

So how do we go about implementing this without hurting performance? Let's walk through each approach I tried and how it affected performance

### Approach 1: Build a new normalized string

The simplest approach is to check if we need to build a new string and replace it if not. This is a great usecase for `Cow`s after all!

Unfortunately, each number needs traversed twice, once to find the range and again to validate it. Even if there are no numbers in our input, heap allocations are slow and this ties us to the string cleanup machinery taking 20% of our instructions!

### Approach 2: 2 `Cow`s

We only care about 2 portions of the string for each number, the part to the left of the `e`, or the mantissa, and the part to the right--the exponent

Say we have `1e+05`, we can store `1` and `5` and reconstruct `1e5`. If we have an exponent, the `e` must be lowercase and any leading `0` or `+`s can be skipped

TODO what about -??????

```rust
pub enum Token<'a> {
    Number {
        mantissa: Cow<'a, str>,
        exponent: Cow<'a, str>
    },
}
```

This works, but lowers performance, which is measured by throughput to avoid size based discrepancies. If we have a 1MB file and a 2MB file, the smaller will be formatted faster, but `MB/s` is comparable for both! Deser refers to deserializing into an abstract syntax tree

TODO explanation of what each file has

| benchmark     | baseline (MB/s) | this (MB/s) | delta  |
| ------------- | --------------- | ----------- | ------ |
| deser/canada  | 115.6           | 101.1       | -12.5% |
| deser/citm    | 385.5           | 289.3       | -25.0% |
| deser/twitter | 257.8           | 214.8       | -16.7% |

Why is this slower?

Obviously there is more number parsing work being done, but there has to be more at play. CITM doesn't have any numbers but had the worst regressions! (TODO verify CITM shape)

The main suspect is doubling our unneccesary cleanup. We will verify this later

TODO more validations and comparisons with others

TODO deep dive into niche optimizations and more. how does rust niche optimize the cow and the token enum?

### Approach 3: use `&str` instead of `Cow<str>`

```rust
pub enum Token<'a> {
    Number {
        mantissa: &'a str,
        exponent: &'a str
    },
}
```

The compiler gets to remove all those cleanup instructions and branches, which is a huge win!

Canada is below baseline, which checks out since it has only numbers and no exponents, so its paying the cost to check for exponents every time.

| benchmark     | baseline (MB/s) | this (MB/s) | delta  |
| ------------- | --------------- | ----------- | ------ |
| deser/canada  | 115.6           | 111.0       | -3.9%  |
| deser/citm    | 385.6           | 442.9       | +14.9% |
| deser/twitter | 258.7           | 341.4       | +32.0% |

### Approach 4: Separate `Mantissa` and `Exponent` variants

Instead of 1 variant holding both parts of the Number, we'll split them up

```rust
pub enum Token<'a> {
    Mantissa(&'a str),
    Exponent(&'a str),
}
```

Most CPUs can read 64 bytes at a time, so holding 2 `&str` or `Cow<str>` limited reads to one Token at a time sine both were over 32 bytes, being 40 and 48 bytes respectively

Variants holding `&str` and `Cow<str>` are both 24 bytes, so we can skip out on some extra read instructions! (TODO how many?)

TODO numbers for cache misses, were there regressions here? is tokens throughput write or read?

Canada deserialization is now better than baseline! uglify tokens is even better, since there's no longer a branch to check if there's an exponent in a Number!

| benchmark             | prev (MB/s) | this (MB/s) | delta  |
| --------------------- | ----------- | ----------- | ------ |
| deser/canada          | 111.0       | 122.6       | +10.5% |
| deser/twitter         | 341.4       | 356.8       | +4.5%  |
| uglify_tokens/canada  | 234.2       | 268.9       | +14.8% |
| uglify_tokens/twitter | 392.2       | 407.4       | +3.9%  |

### Approach 5: Split the state machine

The same principle applies to our Number state machine. This makes sure we only accept valid numbers. For example, numbers can only start with a minus sign or a non zero integer in JSON

Since we started outputting 2 separate `&str` and whether there's a negative exponent, our `NumberState` has ballooned to 88 bytes. It was reasonable to have 1 state machine with one output, but the CPU needs to read 2 times for each state change. Splitting them puts us back at the baseline of 1 read

```rust
enum MantissaState { MinusOrInteger, IntegerOrDecimalOrEnd, Fraction, FractionOrEnd, End }
enum ExponentState  { MinusOrPlusOrDigit, AfterSign, Digits, Zero, End }
```

Additionally, fewer states means fewer options, so the CPU can better predict what will happen and the compiler has an easier time optimizing

TODO what regressions happened?

| benchmark             | prev (MB/s) | this (MB/s) | delta  |
| --------------------- | ----------- | ----------- | ------ |
| deser/citm            | 401.7       | 456.9       | +13.7% |
| deser/twitter         | 356.8       | 385.1       | +7.9%  |
| uglify_ast/twitter    | 5262.6      | 5539.6      | +5.3%  |
| uglify_tokens/citm    | 557.2       | 630.4       | +13.1% |
| uglify_tokens/twitter | 407.4       | 418.2       | +2.7%  |

## Summary

Switching from `Cow` to `str` and splitting `Number` token and state machines both help to improve performance

Canada has only numbers with no exponents, so it has a small regression when deserializing into an AST and pretty printing, but has decent gains with uglifying tokens directly. Other files have improvements across the board for deserialization and uglifying tokens and insignificant changes otherwise

### Deserialization into AST

Canada pays for the extra unused token per number, but citm and twitter have massive improvements

|                        | baseline (MB/s) | new (MB/s) | delta  |
| ---------------------- | --------------- | ---------- | ------ |
| canada (2.25 MB)       | 115.6           | 111.3      | -3.7%  |
| citm_catalog (1.73 MB) | 385.5           | 456.9      | +18.5% |
| twitter (0.63 MB)      | 257.8           | 385.1      | +49.4% |

### Prettify from AST

|              | baseline (MB/s) | new (MB/s) | delta |
| ------------ | --------------- | ---------- | ----- |
| canada       | 1424.7          | 1332.0     | -6.5% |
| citm_catalog | 1853.2          | 1845.3     | -0.4% |
| twitter      | 2091.1          | 2105.0     | +0.7% |

### Uglify from AST

|              | main (MB/s) | HEAD (MB/s) | delta |
| ------------ | ----------- | ----------- | ----- |
| canada       | 3042.0      | 3066.8      | +0.8% |
| citm_catalog | 6908.8      | 7021.2      | +1.6% |
| twitter      | 5176.3      | 5539.6      | +7.0% |

### Uglify from Token Stream

|              | main (MB/s) | HEAD (MB/s) | delta  |
| ------------ | ----------- | ----------- | ------ |
| canada       | 198.9       | 251.2       | +26.3% |
| citm_catalog | 449.8       | 630.4       | +40.2% |
| twitter      | 269.9       | 418.2       | +54.9% |

---

Thanks for coming to my Ted talk. Please consider subscribing to my RSS feed or you will overengineer for a usecase that will never materialize
