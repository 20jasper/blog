---
title: 'Variables in Rust - Rust for TypeScript Developers'
pubDate: '2023-02-12'
description: 'Learn about the differences in scope, initialization, and declaration for variables in TypeScript and Rust'
tags: ['rust', 'typescript']
---

## Table Of Contents

- [Table Of Contents](#table-of-contents)
- [Naming](#naming)
- [Scope](#scope)
- [Initialization](#initialization)
- [Declaration](#declaration)
- [Redeclaration](#redeclaration)
- [Reassignment](#reassignment)
- [Mutability](#mutability)
- [Outro](#outro)

## Naming

In Rust, variables are snake cased, while constants are conventially in screaming snake case

```rust
const CONSTANT_VALUE: i32 = 2;
let non_constant_value = 32;
```

Note that variables defined with `const` must be explicitly typed

---

## Scope

In Rust, variables are block scoped just like variables declared with `let` and `const` in TypeScript

```rust
fn main() {
  let x = 32;
  {
    let x = 12;
    println!("{x}") // 12
  }
  println!("{x}") // 32
}
```

---

## Initialization

In TypeScript, the initialization of variables declared with `var` is hoisted

```ts
console.log(x); // undefined
var x = 12;
console.log(x); // 12
```

The initialization of variables declared with `let` or `const` is not hoisted

```ts
console.log(x);
let x = 12;
```

```
Uncaught ReferenceError: can't access lexical declaration 'x' before initialization
```

However, they are assigned undefined if not given an initializer

```ts
let x;
console.log(x); // undefined
```

Rust takes the more modern behavior of `let` and `const` and takes it one step further. Variables are not assigned a value if not given an initializer

This works

```rust
fn main() {
  let x = 12;
  println!("{x}"); // 12
}
```

This does not

```rust
fn main() {
  let x: i32;
  println!("{x}");
}
```

```rust
error[E0381]: used binding `x` isn't initialized
 --> src/main.rs:4:16
  |
2 |     let x: i32;
  |         - binding declared here but left uninitialized
	|
3 |     println!("{x}");
  |                ^ `x` used here but it isn't initialized
```

---

## Declaration

Variables declared with `const` in Rust can be global, but variables declared with `let` cannot

So this works,

```rust
const X: i32 = 12;

fn main() {

}
```

But this does not

```rust
let x = 12;

fn main() {

}
```

```
error: expected item, found keyword `let`
 --> src/main.rs:1:1
  |
1 | let x = 12;
  | ^^^ consider using `const` or `static` instead of `let` for global variables
```

In TypeScript, variables declared with `var`, `let`, or `const` can be declared anywhere and aren't required to be explicitly typed

```ts
let x = 12;
```

---

## Redeclaration

In TypeScript, variables assigned with `var` can be redeclared locally

```ts
var x = 12;
console.log(x); // 12

var x = 32;
console.log(x); // 32
```

Variables declared with `let` or `const` cannot be redeclared locally

```ts
const x = 12;
console.log(x);

const x = 32;
console.log(x);
```

```ts
Cannot redeclare block-scoped variable 'x'.
```

Rust's `const` works the same as TypeScript's in this sense

```rust
fn main() {
  const X: i32 = 12;
  const X: i32 = 12;
}
```

```rust
error[E0428]: the name `X` is defined multiple times
 --> src/main.rs:5:3
  |
4 |   const X: i32 = 12;
  |   ------------------ previous definition of the value `X` here
5 |   const X: i32 = 12;
  |   ^^^^^^^^^^^^^^^^^^ `X` redefined here
  |
  = note: `X` must be defined only once in the value namespace of this block
```

Rust's `let` works like `var` here—it can be redeclared in the same namespace

```rust
fn main() {
  let x = 12;
  println!("{x}"); // 12

  let x = 43;
  println!("{x}"); // 43
}
```

However, variables declared with `let` can be redeclared with a different type!

```rust
fn main() {
  let x = 32;
  println!("{x}");

  let x = "hi";
  println!("{x}");
}
```

While in TypeScript, variable declarations can't change type

```ts
var x = 1;
var x = 'hi';
```

```rust
Subsequent variable declarations must have the same type.
Variable 'x' must be of type 'number', but here has type 'string'.
```

---

## Reassignment

In TypeScript, variables declared with `const` cannot be reassigned

```ts
const x = 12;
x = 93;
```

```
Cannot assign to 'x' because it is a constant.
```

Variables declared with `var` or `let` can be reassigned

```ts
let x = 12;
console.log(x); // 12

x = 32;
console.log(x); // 32
```

In Rust, variables assigned with both `let` and `const` cannot be reassigned

```rust
fn main() {
  let x = 12;

  x = 23;
}
```

```rust
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:6:3
  |
4 |   let x = 12;
  |       -
  |       |
  |       first assignment to `x`
  |       help: consider making this binding mutable: `mut x`
5 |
6 |   x = 23;
  |   ^^^^^^ cannot assign twice to immutable variable
```

---

## Mutability

As the compiler so kindly pointed out, we can use the `mut` keyword with `let` to make `x` mutable

```rust
fn main() {
  let mut x = 12;
  println!("{x}"); // 12

  x = 23;
  println!("{x}"); // 23
}
```

This differs from TypeScript, where objects and arrays are mutable by default

```ts
const arr = [];
arr.push(1);

console.log(arr); // [1]
```

In Rust, this does not compile without the `mut` keyword

```rust
fn main() {
  let vec = Vec::new();
  vec.push(1);
}
```

```rust
error[E0596]: cannot borrow `vec` as mutable, as it is not declared as mutable
 --> src/main.rs:5:3
  |
4 |   let vec = Vec::new();
  |       --- help: consider changing this to be mutable: `mut vec`
5 |   vec.push(1);
  |   ^^^^^^^^^^^ cannot borrow as mutable
```

---

## Outro

Thank you for reading! Please let me know if you have any suggestions.
