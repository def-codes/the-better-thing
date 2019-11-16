// a standalone state machine
const { INotifyMixin } = require("@thi.ng/api");
const pt = require("@def.codes/process-trees");

const sms = {
  states: {
    closed: {},
    locked: {},
    open: {},
  },
  transitions: [
    ["closed", "open", "open"],
    ["closed", "lock", "locked"],
    ["open", "close", "closed"],
    ["locked", "unlock", "closed"],
  ],
  initial_state: "closed",
};

const ExampleStateMachine = INotifyMixin(
  class ExampleStateMachine {
    constructor() {
      this.set_state(sms.initial_state);
    }
    make_move(transition) {
      const moves = sms.transitions.filter(
        ([state, move]) => state === this.state && move === transition
      );
      if (!moves.length) {
        console.warn(`No move ${transition} for state ${this.state}`);
        return;
      }
      // only recognize first (ignore conditionals)
      const [first] = moves;
      const [, , target] = first;
      this.set_state(target);
    }

    set_state(value) {
      this.state = value;
      this.notify({ id: "state", value });
    }

    open = () => this.make_move("open");
    lock = () => this.make_move("lock");
    close = () => this.make_move("close");
    unlock = () => this.make_move("unlock");
  }
);

const e = new ExampleStateMachine();

e.addListener("state", (...args) => {
  console.log(`STATE LISTENER SAY`, ...args);
});

e.notify({ id: "not-state", value: "bar" });

e.lock();
e.unlock();
e.unlock();
e.close();
e.open();
e.close();
e.lock();

console.log(`e`, e);

module.exports = {
  main() {
    const dot = pt.state_machine_spec_to_dot(sms);
    return dot;
  },
};
