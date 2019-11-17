// INVARIANTS?
//different buffers are almost like different types
// - Fixed buffer is what is described here
// - unbuffered (rendez-vous) is I think not supported in @thi.ng
// - windowing buffer (sliding, dropping) is non-blocking

// STDIN
// - like any input port except that it can block with writer waiting for free space

// STDOUT
// - an async value sequence, but unlike subscriptions
//   - needs a reader
//   - can block with reader waiting for value
//   - values only go to one reader

// CSP channel
import { Channel } from "@thi.ng/csp";

export const CSP_CHANNEL_TYPE_IRI = "http://thi.ng/csp#Channel";

interface CSPChannelBlueprint {
  buffer_type: "fixed" | "sliding" | "dropping";
  capacity: number;
}

// REFLECT
import { datafy_protocol } from "@def.codes/datafy-nav";
interface CSPChannelDescription extends CSPChannelBlueprint {
  "@type": typeof CSP_CHANNEL_TYPE_IRI;
  // TODO @context
}
datafy_protocol.extend(
  Channel,
  (instance): CSPChannelDescription => {
    return {
      "@type": CSP_CHANNEL_TYPE_IRI,
      // TODO: Are these retrievable?
      buffer_type: "fixed", // instance.?,
      capacity: 1, // instance.?
    };
  }
);
/////

// STATE MACHINE
// for fixed buffer (NOTE state machine can vary by instance/subclass)
import { StateMachineSpec } from "./state-machines";
export const fixed_buffer_state_machine: StateMachineSpec = {
  states: {
    empty: { label: "blocking read" },
    full: { label: "blocking write" },
    normal: {},
    done: { terminal: true },
    error: { terminal: true },
  },
  transitions: [
    ["empty", "+", "full", { condition: "count = size" }],
    ["empty", "+", "normal"],
    ["full", "-", "empty", { condition: "count = 0" }],
    ["full", "-", "normal"],
    ["normal", "-", "empty", { condition: "count = 0" }],
    ["normal", "+", "full", { condition: "count = size" }],
    ["normal", "+", "normal"],
    ["normal", "-", "normal"],
    // In other words `* --close--> done`
    ["empty", "close", "done"],
    ["full", "close", "done"],
    ["normal", "close", "done"],
    // same for error?
    ["empty", "error", "error"],
    ["full", "error", "error"],
    ["normal", "error", "error"],
  ],
  initial_state: "empty",
};
