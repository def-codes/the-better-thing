// Also a special kind of process
// - it's first class in the language now
// - a pull-based async sequence
// - technically can be used as a coroutine via `next(value)` and `yield` expressions
//   - but that is based on hard code so we don't want to model that using this construct

// REIFY?
// not exactly.  more like promise, wrap

// REFLECT?
// Possibly.  But [Symbol.asyncIterable] is a property, not a type
// something could have it and still be something else

// STDIN
// no.  interface is pull-based. next(): Promise<{ done: boolean, value: T }>

// STDOUT
// value stream, of course.  but pull-based
// also has state (done)
// has error, but only once, right?  i.e. error is an unrecoverable state
// except both have an associated value

// STATE MACHINE
// This extends the state machine for sync iterable
// in that, since the value of `next()` is a promise, it has its own states
// That substate could be reflected directly in this
import { StateMachineSpec } from "./state-machines";
export const async_iterable_state: StateMachineSpec = {
  states: {
    normal: {},
    done: { terminal: true },
    error: { terminal: true },
  },
  transitions: [
    ["normal", "next", "normal"],
    // transition is return?
    ["normal", "next", "done"],
    ["normal", "throw", "error"],
  ],
  initial_state: "normal",
};
/////
