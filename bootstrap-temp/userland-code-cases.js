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
    label: "A constant stream",
    userland_code: `ConstantStream$Alice.hasValue(42)`,
  },
  {
    label: "A ticker",
    userland_code: `ATicker$Alice.hasInterval(1000)`,
  },
  {
    label: "A ticker with a listener",
    userland_code: `TickerWithListener$Alice.hasInterval(1000)
TickerWithListener$Bob.listensTo.TickerWithListener$Alice`,
  },
  {
    label: "A ticker with a mapping listener",
    userland_code: `MappingListener$Alice.hasInterval(1000)
MappingListener$Bob.listensTo.MappingListener$Alice
// MappingListener$Bob.transformsWith(mapsWith(x => x * x))
`,
  },
  {
    label: "Reuse a transducer",
    userland_code: `ReuseTransducer$Alice.hasInterval(1000)
ReuseTransducer$Bob.listensTo.ReuseTransducer$Alice
ReuseTransducer$Carol.listensTo.ReuseTransducer$Alice
ReuseTransducer$Tranny(mapsWith(x => x * x))
ReuseTransducer$Bob.transformsWith(ReuseTransducer$Tranny)
ReuseTransducer$Carol.transformsWith(ReuseTransducer$Tranny)
`,
  },
  {
    label: "Subclass inference",
    userland_code: `SubclassInference$Alice(isa(Woman), name("Alice"))
SubclassInference$Bob(isa(Man))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
  },
  {
    label: "A query",
    userland_code: `AQuery$Alice(queryText("?thing isa ?type"))
AQuery$Bob(listensTo(AQuery$Alice), transformsWith(mapsWith(function(v) {
this.console.log("Bob?")
this.console.log("Bob", v)
return v
})))
`,
  },
  {
    label: "A forcefield",
    userland_code: `AForcefield$Alice(isa(Forcefield))`,
  },
  {
    label: "A forcefield and a force",
    userland_code: `AndAForce$Alice(isa(Forcefield))
// Eeek, model requires camelcase names for types
AndAForce$Bob(isa(forceX), x(50))
`,
  },
  {
    label: "A forcefield with a force",
    userland_code: `WithAForce$Alice(isa(Forcefield))
WithAForce$Bob(isa(forceX), x(50))
WithAForce$Alice(hasForce(WithAForce$Bob))
`,
  },
  {
    label: "A forcefield with bodies",
    userland_code: `WithBodies$Alice(isa(Forcefield))
WithBodies$Bob(isa(forceX), x(50))
WithBodies$Alice(hasForce(WithBodies$Bob))
WithBodies$Alice(hasBodies(hasValue([{id: "foo"}, {id:"bar"}])))
`,
  },
  {
    label: "A fully-functioning forcefield",
    userland_code: `FullForce$Alice(isa(Forcefield))
FullForce$Bob(isa(forceX), x(50))
FullForce$Alice(hasForce(FullForce$Bob))
FullForce$Alice(hasBodies(hasValue([{id: "foo"}, {id:"bar"}])))
FullForce$Alice(hasTicks(hasInterval(500)))
`,
  },
  {
    label: "HDOM region reference",
    // How to assert a connection from Bob's output to an hdom region?
    userland_code: `TickerWithListener$Alice.hasInterval(1000)
TickerWithListener$Bob.listensTo.TickerWithListener$Alice
TickerWithListener$Bob.emits.Templates
TickerWithListener$Bob.transformsWith(mapsWith(x => ({
  element: "details",
  children: [
    {
      element: "summary",
      children: [{ element: "b", children: ["the state of Alice"] }]
    },
    { element: "p", children: [x.toString(), " ticks"] }
  ]
})))
`,
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
