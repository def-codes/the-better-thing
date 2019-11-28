// i dunno, maybe some test cases?

const code = `a = timer(1000)`;
// What's the result of this?
// a thing with a child locally named `a`
// that is defined as “1000 applied to whatever `timer` is (or turns out to be)”
const initial_expressions = [
  {
    assign: {
      term: "a",
      value: [{ term: "timer" }, { apply: [{ literal: 1000 }] }],
    },
  },
];

// interpretation context is, we're defining a thing
const next_state = {
  children: {
    a: { expr: [{ term: "timer" }, { apply: [{ literal: 1000 }] }] },
  },
};

// If we suppose that `timer` is a reactive variable, that its definition (if
// not its meaning) might change later, then we might think of this as really
// saying
// - create a subsystem that queries the system for the value `timer`
// - provide the (fully-resolved, i.e. not expandable) result to a dataflow node
// - give that result to the interpreter
//   - or at that point we may call it the evaluator, everything being resolved
//
// Evaluating this must result in what?
// - the system is itself a thing, so there's some top node where this happens?
// - insufficient context
//
// These are just expressions, evaluating them has no effect.
//
// Statements can have an effect.  Specific kinds of statements, definitions.

// interpret(initial_expressions);

// part one: an open expression
// x is unresolved
const open_expression = { term: "x" };

// part two: a context
// note "values" are actually just expressions
const a_context = { x: { literal: 3 } };

// part three: a closed expression
// this would be the result of expansion
const closed_expression = { literal: 3 };

// part four: evaluate for fun & profit
// this would be the result of evaluate
const result_for_fun_and_profit = 3;

// questions: could/should we use symbols here?
// quicker comparison, a little more suited to purpose
// but, not serialized by default
// so, runtime-bound (though unnecessarily in the case of Symbol.for)

// another example
const another_open_expression = { apply: [{ term: "x" }], to: { term: "f" } };

const another_context = { x: { literal: 3 }, f: { literal: n => n * 2 } };

const another_closed_expression = {
  apply: [{ literal: 3 }],
  to: { literal: n => n * 2 },
};

const another_result = 6;
