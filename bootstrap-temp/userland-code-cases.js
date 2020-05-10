define([], () => [
  {
    label: "Single fact with literal",
    userland_code: `Alice(name("Alice"))`,
    // name(rdfs.subpropertyOf(rdf.label))
  },
  {
    label: "Single fact with object value",
    userland_code: `Alice(isa(Person))`,
  },
  {
    label: "Two facts about one subject",
    userland_code: `Alice(isa(Person), name("Alice"))`,
  },
  {
    label: "Two subjects",
    userland_code: `Alice(isa(Woman))
Bob(isa(Man))`,
  },
  {
    label: "Minimal dataflow example",
    // Not even sure Bob is needed...
    userland_code: `Alice.hasInterval(1000)
Bob.listensTo.Alice`,
  },
  {
    label: "Subclass inference",
    userland_code: `Alice(isa(Woman), name("Alice"))
Bob(isa(Man))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
  },
  {
    label: "Model with interpretation and representation",
    userland_code: `
ModelPrototype(
  hasPart(Recipe),
  hasPart(Kitchen),
  hasPart(InterpretationOfRecipe),
  hasPart(InterpretationOfKitchen)
)
`,
  },
]);
