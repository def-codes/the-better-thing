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
    ["empty", "error", "done"],
    ["full", "error", "done"],
    ["normal", "error", "done"],
  ],
  initial_state: "empty",
};
