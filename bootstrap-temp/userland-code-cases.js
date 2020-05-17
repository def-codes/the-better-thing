// TODO: The pseudo-namespaces used here are a stopgap to keep the model's
// entities distinct from each other.  Instead, the reader should apply a
// namespace from context to local names.  (Note that e.g. classes will
// presumably come from shared namespaces).
define([], () => [
  {
    label: "Single fact with literal",
    userland_code: `SingleFactLiteral$Alice(name("Alice"))`,
    // name(rdfs.subpropertyOf(rdf.label))
  },
  {
    label: "Single fact with object value",
    userland_code: `SingleFactObject$Alice(isa(Person))`,
  },
  {
    label: "Two facts about one subject",
    userland_code: `TwoFactsOneSubject$Alice(isa(Person), name("Alice"))`,
  },
  {
    label: "Two subjects",
    userland_code: `TwoSubjects$Alice(isa(Woman))
TwoSubjects$Bob(isa(Man))`,
  },
  {
    label: "A ticker",
    userland_code: `ATicker$Alice.hasInterval(1000)`,
  },
  {
    label: "A ticker with a listener",
    userland_code: `TickerWithListener$Alice.hasInterval(1000)
TickerWithListener$Bob.listensTo.Alice`,
  },
  {
    label: "A ticker with a mapping listener",
    userland_code: `TickerWithListener$Alice.hasInterval(1000)
TickerWithListener$Bob.listensTo.TickerWithListener$Alice
// TickerWithListener$Bob.transformsWith(mapsWith(x => x * x))
TickerWithListener$Bob.transformsWith(mapsWith(x => ["details", {}, ["summary", {}, ["b", {}, "the state of Alice"]], ["p", {}, x, " ticks"]]))
`,
  },
  {
    label: "Subclass inference",
    userland_code: `SubclassInference$Alice(isa(Woman), name("Alice"))
SubclassInference$Bob(isa(Man))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
  },
  //  {
  //    label: "HDOM region reference",
  //    userland_code: `placeholder`,
  //  },
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
