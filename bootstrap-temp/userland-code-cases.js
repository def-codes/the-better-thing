// TODO: The pseudo-namespaces used here are a stopgap to keep the model's
// entities distinct from each other.  Instead, the reader should apply a
// namespace from context to local names.  (Note that e.g. classes will
// presumably come from shared namespaces).

const style = nodes =>
  nodes
    .map(
      _ =>
        `[resource="${_.id}"] { --x: ${_.x}; --y: ${_.y}; position: absolute }`
    )
    .join("\n");

// TODO: require ID / make this a dictionary, etc
define([], () => [
  {
    id: "SingleFactLiteral",
    label: "Single fact with literal",
    userland_code: `SingleFactLiteral$Alice(name("Alice"))`,
    // name(rdfs.subpropertyOf(rdf.label))
  },
  {
    id: "SingleFactObject",
    label: "Single fact with object value",
    userland_code: `SingleFactObject$Alice(isa(Person))`,
  },
  {
    id: "TwoFactsOneSubject",
    label: "Two facts about one subject",
    userland_code: `TwoFactsOneSubject$Alice(isa(Person), name("Alice"))`,
  },
  {
    id: "TwoSubjects",
    label: "Two subjects",
    userland_code: `TwoSubjects$Alice(isa(Woman))
TwoSubjects$Bob(isa(Man))`,
  },
  {
    id: "ConstantStream",
    label: "A constant stream",
    userland_code: `ConstantStream$Alice.hasValue(42)`,
  },
  {
    id: "ATicker",
    label: "A ticker",
    userland_code: `ATicker$Alice.hasInterval(1000)`,
  },
  {
    id: "TickerWithListener",
    label: "A ticker with a listener",
    userland_code: `TickerWithListener$Alice.hasInterval(1000)
TickerWithListener$Bob.listensTo.TickerWithListener$Alice`,
  },
  {
    id: "MappingListener",
    label: "A ticker with a mapping listener",
    userland_code: `MappingListener$Alice.hasInterval(1000)
MappingListener$Bob.listensTo.MappingListener$Alice
// MappingListener$Bob.transformsWith(mapsWith(x => x * x))
`,
  },
  {
    id: "ReuseTransducer",
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
    id: "SubclassInference",
    label: "Subclass inference",
    userland_code: `SubclassInference$Alice(isa(Woman), name("Alice"))
SubclassInference$Bob(isa(Man))
Woman(subclassOf(Person))
Man(subclassOf(Person))`,
  },
  {
    id: "AQuery",
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
    id: "AForcefield",
    label: "A forcefield",
    userland_code: `AForcefield$Alice(isa(Forcefield))`,
  },
  {
    id: "AndAForce",
    label: "A forcefield and a force",
    userland_code: `AndAForce$Alice(isa(Forcefield))
// Eeek, model requires camelcase names for types
AndAForce$Bob(isa(forceX), x(50))
`,
  },
  {
    id: "WithAForce",
    label: "A forcefield with a force",
    userland_code: `WithAForce$Alice(isa(Forcefield))
WithAForce$Bob(isa(forceX), x(50))
WithAForce$Alice(hasForce(WithAForce$Bob))
`,
  },
  {
    id: "WithBodies",
    label: "A forcefield with bodies",
    userland_code: `WithBodies$Alice(isa(Forcefield))
WithBodies$Bob(isa(forceX), x(50))
WithBodies$Alice(hasForce(WithBodies$Bob))
// TODO: this is broken because of issue with constant stream from literal reader
WithBodies$Alice(hasBodies(hasValue([{id: "foo"}, {id:"bar"}])))
`,
  },
  // TODO: get rid of this, it was a scaffold.  but some bits are ok
  {
    label: "A fully-functioning forcefield WIP",
    userland_code: `FullForce$Alice(isa(Forcefield))
FullForce$Bob(isa(forceX), x(250))
FullForce$Joe(isa(forceY), y(250))
FullForce$Alice(hasForce(FullForce$Bob, FullForce$Joe))
FullForce$Alice(hasTicks(hasInterval(500)))
FullForce$Eve(listensTo(FullForce$Alice$ticks), transformsWith(plucks(1)))
// FullForce$Evan(listensTo(FullForce$Eve), transformsWith(plucks("x")))
FullForce$Evan(
  listensTo(FullForce$Eve), 
  transformsWith(
    mapsWith((x, undefined) => x === undefined ? "(undefined)" : x.x)
  )
)
FullForce$Alice2(isa(Space), hasPart(foo), hasPart(bar), hasPart(bat))
FullForce$Alice$bodies(
  listensTo(queryText("FullForce$Alice2 hasPart ?part")),
  transformsWith(mapsWith(function(parts) {
    return this.Array.from(parts, _ => ({
      id: _.part.value, 
      x: this.Math.random() * 500,
      y: this.Math.random() * 500,
    }))
  }))
)

FullForce$RULZ(
  listensTo(FullForce$Alice$ticks),
  emitsTemplatesFor(FullForce$Alice2),
  transformsWith(
    mapsWith((nodes) => {
      const style = ${style.toString()}
      return { element: "style", children: [style(nodes)] }
    })
  )
)
`,
  },
  {
    id: "FullForce",
    label: "A fully-functioning forcefield",
    userland_code: `FullForce$Alice(
  isa(Space),
  hasPart(foo, bar, bat)
)
FullForce$Bob(isa(forceX), x(250))
FullForce$Joe(isa(forceY), y(150))
FullForce$Alice$forcefield.forcefieldFor(FullForce$Alice)
FullForce$Alice$forcefield(
  hasForce(FullForce$Bob, FullForce$Joe),
  hasTicks(hasInterval(500))
)

`,
    comment: `Rep driver has a rule that asserts forcefield, but this is for model itself`,
  },
  {
    id: "HDOMbug",
    label: "HDOM regions bug repro",
    userland_code: `
HDOMbug$Alice(isa(HDOMbug$Space))
`,
  },
  {
    label: "HDOM region reference",
    // TODO: get rid of this?  disabling ‘emits’ rule because this is the only place it's used
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
