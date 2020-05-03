// What is this thing's job?
// Combine an RDF dataset with a runtime registry
define(["@def.codes/rstream-query-rdf"], cool => {
  const { Dataset } = cool;

  class MeldSystem {
    // knowledge base
    dataset = new Dataset();
    constructor() {
      // console.log(`Oh we in biznessssssssssssss`, this.datset);
    }
    // What is model?
    interpret(model) {}
  }

  const SYSTEM_IRI = "https://def.codes/meld/system";

  // We *really* want this to be a singleton
  const get_system_singleton = () => {
    const existing = globalThis[SYSTEM_IRI];

    if (!existing) {
      const system = new MeldSystem();
      Object.defineProperty(globalThis, SYSTEM_IRI, { value: system });
      return system;
    }
    // Could this even happen?  Even if this factory were re-invoked,
    // `MeldSystem` would have a new value each time.  And a valid AMD loader
    // would not do that, anyway.
    if (existing instanceof MeldSystem) return existing;
    throw new Error(
      `assert fail: existing value at globalThis.${SYSTEM_IRI} is not a MELD system`
    );
  };

  return { system: get_system_singleton() };
});
