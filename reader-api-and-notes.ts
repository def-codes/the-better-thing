type Statement = Assignment | TermTree;
type Assignment = { assign: { term: string; value: AnyExpression } };
type TermTree = [Term, ...(Term | Application)[]];
type Term = { term: string };
type Application = { args: AnyExpression[] };
type AnyExpression = TermTree | { literal: Literal };
type Literal = Array<AnyExpression> | Record<PropertyKey, AnyExpression> | Atom;
type Atom = string | number | boolean | symbol | bigint | RegExp | Function;

/*

A single term is a term expression
You can join a term to a term expression
You can apply any term expression to any list of inner expressions
inner expressions are term expressions plus literals

// 1 way to combine 1 term
A
A()
A()()

None of these constructs *mean* anything.  The effect of application, with or
without arguments, is up to the interpreter.

Both chaining and calling are right-associative.  Grouping subexpressions has no
effect.  These forms

(A())()()
(A()())()

are equivalent to (and indistinguishable from)

A()()


// 2 ways to combine 2 terms
A.B
A(B)

i.e.

(A)(B) is the same as A
(A.B)(C) is the same as A.B(C)
// induction, etc

As a result, you can simplify the representation of term-based expressions by
using lists (which is what I did in the first place).




*/
A.B.C;
A.B(C /* ... */);
A(B /* ... */).C;
A(B, C /* ... */);
A(B.C /* ... */);
A.B(C /* ... */); // same as (A.B)(C) but that would give unexpected result with ASI
A(B /* ... */)(C /* ... */); // same as (A)(B)(C)
A(B(C /* ... */) /* ... */);

/*

Reasons to use application:
- need literals
- group terms separately from rest of expression (but still join to it)
- different semantics than extension by term

*/

// Examples
const STATEMENTS: Statement[] = [
  { assign: { term: "Hello", value: { literal: "World" } } },
  [{ term: "Alice" }],
  [{ term: "Alice" }, { term: "isa" }],
  [{ term: "Alice" }, { term: "isa" }, { term: "Person" }],
  [{ term: "Alice" }, { term: "isa" }, { args: [{ literal: 3 }] }],
  [{ term: "Alice" }, { term: "hasFriends" }, { args: [{ literal: [] }] }],
  [
    { term: "Alice" },
    { term: "hasFriends" },
    { args: [{ literal: [{ literal: 3 }] }] }
  ],
  [{ term: "Alice" }, { term: "hasLibrary" }, { args: [{ literal: {} }] }],
  [
    { term: "Alice" },
    { term: "hasPets" },
    { args: [{ literal: { Basil: { literal: "dog" } } }] }
  ]
];
