import { StateMachineSpec } from "./state-machines";

export const ESSENTIAL_PROCESS_MACHINE_SPEC: StateMachineSpec = {
  states: {
    alive: {},
    dead: { terminal: true },
  },
  transitions: [["alive", "die", "dead"]],
  initial_state: "alive",
};

// what does it look like to do something with state machine
//
// - way to read state (port/property) when applicable
// - way to write state when applicable
// - way to detect a change in state (when applicable?) (same as port?)
// - in all cases, use the state (and transition) codes in spec
// - note that even for reified processes, state may be derivative
//   - but it's not the SM spec's job to describe that
// - when a terminal state is detected, invoke process die
// - when the process dies, move to the dead state (this is owned by the system)
