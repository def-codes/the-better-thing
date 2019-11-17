// LABEL: generator
//
// COMMENT:
// stateful, synchronous sequence
// pull-based stream
// like a synchronous ingress (a value provider)
// a generator is not a process as such, in that it can't do anything on its own
// i.e. it's not a call site for events that can occur at any time
//
// MESSAGES:
// sequence values
//
// STDIN:
// next(value).
// sends value to `yield` expressions and next yielded value to stdout
//
// STDOUT:
// yielded values
//
// CONTINGENT/ENTAILED PROCESSES:
// none
//
// STATE MACHINE
// see also async-iterable
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
