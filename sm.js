const pt = require("@def.codes/process-trees");
// console.log(`pt`, pt);

const sms = {
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

module.exports = {
  main() {
    const dot = pt.state_machine_spec_to_dot(sms);
    return dot;
  },
};
