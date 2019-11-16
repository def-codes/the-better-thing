// a standalone state machine
const { INotifyMixin } = require("@thi.ng/api");

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
    get_state_machine_spec() {
      return sms;
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

const TRANSITIONS = [
  "lock",
  "unlock",
  "unlock",
  "close",
  "open",
  "close",
  "lock",
];

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

(async function() {
  for (const x of TRANSITIONS) {
    await timeout(500);
    e.make_move(x);
  }
})();

module.exports = {
  main() {
    return e;
  },
};
