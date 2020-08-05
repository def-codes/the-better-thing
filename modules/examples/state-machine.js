define([], () => {
  // What do you need to describe a state machine?
  // A set of states S
  // A set of transitions Q, which are each SxS
  // A set of terminal states T⊂S
  //
  // Things you can do with this:
  // - state machine specs
  //   - describe / define
  //   - display
  // - state machine instances
  //   - inquire about the state of a thing
  //   - recognize defined states of a thing
  //   - indicate the state of a thing against a transition diagram
  return {
    "@context": {
      rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      rdfs: "http://www.w3.org/2000/01/rdf-schema#",
      id: "@id",
      // Also designate value space as having an implicit namespace...
      // (So you don't need "rdfs:" prefix)
      type: "@type",
      comment: "rdfs:comment",
      domain: "rdfs:domain",
      range: "rdfs:range",
    },

    // Vocabulary
    State: { comment: "A distinct state of a state machine model." },
    // No, terminality is specific to the machine, not the state.
    // TerminalState: { comment: "A state from which no moves can be made." },
    Transition: { comment: "An allowed move in a state machine model." },
    StateMachineSpec: {
      comment:
        "A model comprising a set of states and labeled transitions between them.",
    },
    StateMachineInstance: {
      comment:
        "An instance of a model whose state is expected to follow a prescribed set of transitions.",
    },
    hasState: { domain: "StateMachineSpec", range: "State" },
    hasTransition: { domain: "StateMachineSpec", range: "Transition" },
    from: { domain: "Transition", range: "State" },
    to: { domain: "Transition", range: "State" },

    // But what about model has state?
    hasSpec: { domain: "StateMachineInstance", range: "StateMachineSpec" },
    inState: { domain: "StateMachineInstance", range: "State" },

    // Instances
    TwoStateDoor: {
      comment: "A door that can be open or closed",
      hasState: ["Opened", "Closed"],
      hasTransition: {
        Close: { from: "Opened", to: "Closed" },
        Open: { from: "Closed", to: "Opened" },
      },
    },

    Subscription: {
      comment: "A dataflow broadcast node",
      hasState: ["IDLE", "ACTIVE", "DONE", "ERROR", "DISABLED"],
      hasTransition: {
        Close: { from: "Opened", to: "Closed" },
        Open: { from: "Closed", to: "Opened" },
      },
    },
  };
});
