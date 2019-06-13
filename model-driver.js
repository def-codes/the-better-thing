// thinking now that this isn't a thing.  all can be better done by the system.

// still depends on the system for the actual query support etc
//
// this just provides broadcasts of datafied resources belonging to the model.
//
// should it be the thing that accepts assertions?
// are we assuming one model per system?
// if so, what's the point of this?
//
// the model is the thing of which the system is an implementation.
// it just happens to also rely on the system

const MODEL_DRIVER = {
  claims: q("Model isa Class"),
  rules: [{ when: q() }]
};
