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
    id: "Merge",
    label: "A merge node",
    userland_code: `Merge$Alice.hasInterval(1000)
Merge$Bob.hasInterval(500)
Merge$Carol(listensTo(Merge$Alice, Merge$Bob))
`,
  },
  {
    id: "MergeTrans",
    label: "A merge node with a transformer",
    userland_code: `MergeTrans$Alice.hasInterval(1000)
MergeTrans$Bob.hasInterval(500)
MergeTrans$Eve(
  listensTo(MergeTrans$Alice, MergeTrans$Bob),
  transformsWith(filtersWith(x => x % 2 === 0))
)

`,
  },
  {
    id: "Sync",
    label: "A sync node",
    userland_code: `Sync$Alice.hasInterval(1000)
Sync$Bob.hasInterval(500)
// No way to write these as blank nodes currently
Sync$Source1(alias("a"), source(Sync$Alice))
Sync$Source2(alias("b"), source(Sync$Bob))
Sync$Carol(syncs(Sync$Source1, Sync$Source2))

`,
  },
  {
    id: "SyncTrans",
    label: "A sync node with a transform",
    userland_code: `SyncTrans$Alice.hasInterval(1000)
SyncTrans$Bob.hasInterval(500)
// No way to write these as blank nodes currently
SyncTrans$Source1(alias("a"), source(SyncTrans$Alice))
SyncTrans$Source2(alias("b"), source(SyncTrans$Bob))
SyncTrans$Carol(syncs(SyncTrans$Source1, SyncTrans$Source2))
SyncTrans$Carol(transformsWith(mapsWith(x => x.a + x.b)))

`,
  },
  {
    id: "MappingListener",
    label: "A ticker with a mapping listener",
    userland_code: `MappingListener$Alice.hasInterval(1000)
MappingListener$Bob.listensTo.MappingListener$Alice
MappingListener$Bob.transformsWith(mapsWith(x => x * x))
`,
  },
  {
    id: "PluckNullish",
    label:
      "Pluck returns undefined if the plucked key doesn't exist (as with key access)",
    userland_code: `PluckNullish$Alice.hasInterval(500)
PluckNullish$Bob(listensTo(PluckNullish$Alice), transformsWith(partitionsBy(5)))
PluckNullish$Carol(
  listensTo(PluckNullish$Bob),
  transformsWith(mapsWith(function(x) {
    // TODO: re test for slice, see bug about first value of partition
    return x.slice && x.slice(0, this.Math.round(5 * this.Math.random()))
  }))
)
PluckNullish$Thurston(listensTo(PluckNullish$Carol), plucks(3))
`,
  },
  {
    id: "PluckNullishInput",
    label: "Pluck should not crash if the input is undefined (say I)",
    userland_code: `PluckNullishInput$Alice.hasInterval(500)
PluckNullishInput$Bob(
  listensTo(PluckNullishInput$Alice),
  transformsWith(partitionsBy(5))
)
PluckNullishInput$Carol(
  listensTo(PluckNullishInput$Bob),
  transformsWith(mapsWith(function(x, undefined) {
    return this.Math.random() < 0.5 ? x : null
  }))
)
PluckNullishInput$Thurston(
  listensTo(PluckNullishInput$Carol), 
  transformsWith(plucks(3))
)
`,
  },
  {
    id: "MultipleListeners",
    label: "A ticker with multiple listeners",
    userland_code: `MultipleListeners$Alice.hasInterval(500)
MultipleListeners$Bob(
  listensTo.MultipleListeners$Alice,
  transformsWith(mapsWith(x => x * x))
)
MultipleListeners$Eve(
  listensTo.MultipleListeners$Alice,
  transformsWith(filtersWith(x => x % 2 === 0))
)
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
