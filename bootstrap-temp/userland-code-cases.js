define([], () => [
  {
    label: "Single fact with literal",
    userland_code: `Alice(name("Alice"))`,
  },
  {
    label: "Single fact with object value",
    userland_code: `Alice(a(Person))`,
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
