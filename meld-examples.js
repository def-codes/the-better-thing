const SPACE_COMMON = `space.isa.Forcefield,
space.hasForce.center,
space.hasForce.charge,
center.isa.forceCenter,
charge.isa.forceManyBody,
charge.strength(-200),
charge.distanceMax(250),
charge.theta(0.98),
`;

const MELD_EXAMPLES = [
  {
    name: "views",
    label: "views",
    comment: "WIP approach to views",
    userland_code: `Alice . hostOutput("Alice")
Bob . hostOutput("Bob")

// model.contains.v

Alice . hasInterval(100)

Bob.listensTo.Alice
v.viewOf.Bob
v.viewIn.home

// Carol.listensTo.Bob
// Carol.transformsWith.m
// m.mapsWith(c => c)

Carol.hostOutput("Carol")

// foo.listensTo.ListenerForv
// foo.transformsWith.h
// h.hasRoot.home

//ListenerForv.hostOutput("lv")

`
  },
  {
    name: "subgraph-view",
    label: "subgraph view",
    comment: "Subgraphs.",
    userland_code: `Alice . hostOutput("Alice")
Alice . isa . AllFacts

`
  },

  {
    name: "hdom",
    label: "primitive hdom",
    comment:
      "@thi.ng/hdom transducer can be bound to a DOM node to keep DOM synced with a template.",
    userland_code: `Alice . hostOutput("Alice")
Bob . hostOutput("Bob")

Alice . hasInterval(100)

Bob.listensTo.Alice
Bob.transformsWith.h
h.hasRoot.home

// Alice . knows . Bob
// X.contains.Y
// P.isa.Circle
// Q.isa.Square
`
  },

  {
    name: "hdom-template",
    label: "hdom with template",
    comment: "Typically, an hdom node is preceded by a mapping transform.",
    userland_code: `Alice . hostOutput("Alice")
Carol.hostOutput("Carol")
Bob . hostOutput("Bob")
Joan . hostOutput("Joan")

Alice . hasInterval(100)

Carol.listensTo.Joan

Carol.transformsWith.m
m.mapsWith(n  => ["p", {}, '#', n ])

Joan .listensTo.Alice
Joan . transformsWith.j
j.mapsWith(x => x % 2)

Bob.listensTo.Carol
h.hasRoot.home
Bob.transformsWith.h
`
  },

  {
    name: "host",
    label: "host interop (dataflow output)",
    comment: `A model needs a host in order to function.  Since an empty model can't do anything—not even display its own contents!—we'll need help from the host in order to get this thing off the ground.`,
    userland_code: `Alice . hasInterval(100)
Alice . hostOutput("Alice")

// Uncomment to add a port for bob
// Bob.hasInterval(250)
// Bob.hostOutput("Robert")

`
  },

  // Which of these examples should come first?
  // without subscription, how do you see the results?
  // without stream, how do you get a dataful source to subscribe to?
  {
    name: "streams",
    label: "streams driver",
    comment: `testing reified streams`,
    userland_code: `
// stream . isa . Stream // (implicit)
// stream . hasSource("brother") // will be ignored with warning
stream . hasSource(sub => { sub.next("hello"); sub.next("world"); })
//sub . listensTo . stream

`
  },

  {
    name: "ticker",
    label: "tikers",
    comment: `A ticker is a stream that counts over a specified time interval.`,
    userland_code: `Alice . hasInterval(1000)
Bob . hasInterval(250)
`
  },

  {
    name: "subscription",
    label: "subscription driver (verbose)",
    comment: `in which Alice and Bob listen to one another`,
    userland_code: `// Display
Alice.hostOutput("Alice")
Carol.hostOutput("Carol")

Carol.hasInterval(200)

Alice . listensTo . Carol
//Alice . listensTo . Joan

`
  },

  {
    name: "subscription-chain",
    label: "subscription chain (transitive listening)",
    comment: `a game of telephone`,
    userland_code: `// Display
Alice.hostOutput("Alice")
Bob.hostOutput("Bob")
Carol.hostOutput("Carol")

Alice.hasInterval(200)
Bob . listensTo . Alice
Carol . listensTo . Bob

`
  },

  {
    name: "subscription-broadcast",
    label: "subscription broadcast (multiple listeners)",
    comment: `Alice speaks directly to everyone`,
    userland_code: `// Display
Alice.hostOutput("Alice")
Bob.hostOutput("Bob")
Carol.hostOutput("Carol")

Alice.hasInterval(200)
Bob . listensTo . Alice
Carol . listensTo . Alice

`
  },

  {
    name: "stream-merge",
    label: "merging streams",
    comment: `in which Alice listens to two people at once`,
    userland_code: `// Display
Alice.hostOutput("Alice"),
Carol.hostOutput("Carol")
Joan.hostOutput("Joan")

Carol.hasInterval(200)

Alice . listensTo . Carol

Joan.hasInterval(500)

// Uncomment to see Alice merging Carol & Joan's output
//Alice . listensTo . Joan

`
  },

  {
    name: "subscription-simple",
    label: "subscription driver",
    comment: `in which Alice and Bob listen to one another`,
    userland_code: `
Alice . listensTo . Bob
Bob . listensTo . Carol
Carol . hasInterval(10)

`
  },

  {
    name: "transducers",
    label: "transducers",
    comment: `Transducers are algorithmic stream transformations`,
    userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . t
t.mapsWith(x => x * 2)

`
  },

  {
    name: "mapping-transducers",
    label: "mapping transducers",
    comment: `Mapping transducers apply a transformation to every value in an input stream.`,
    userland_code: `
Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . t
t.mapsWith(x => x * 2)

`
  },

  {
    name: "filtering-transducers",
    label: "filtering transducers",
    comment: `Filtering conditionally includes values from an input stream.`,
    userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . t
t.filtersWith(x => x % 2 == 1)

`
  },

  {
    name: "partitioning-transducers",
    label: "partitioning transducers",
    comment: `Partitioning batches an output stream by some size.`,
    userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . t
t.partitionsBy(3)

`
  },

  {
    name: "sparql-where",
    label: "SPARQL WHERE",
    comment: `SPARQL queries support a WHERE clause for describing the subgraphs you're interested in.`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

// A standalone WHERE doesn't do anything...  right?
WHERE(Alice.knows.$someone)
// results [{someone: Bob}, {someone: Carol}]

// Note this “someone” is independent of the above
WHERE($anyone.knows.$someone)
// results [{anyone: Alice, someone: Bob}... etc

// Clauses are conjunctive (and-ed)
WHERE(Alice.knows.$someone, Carol.knows.$someone)
// results [{someone: Bob}]

// No results
WHERE(Alice.knows.$someone, Bob.knows.$someone)
// results []

`
  },

  {
    name: "sparql-select",
    label: "SPARQL SELECT",
    comment: `SELECT is one of the four ways to request results from a SPARQL query.  For each
time that the pattern matched in the graph, creates a “record,” which is a
dictionary containing the matched value for the defined variables.`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

SELECT($someone)
.WHERE($someone.knows.Alice)

SELECT($someone, $anyone)
.WHERE($someone.knows.$anyone)

`
  },

  {
    name: "sparql-construct",
    label: "SPARQL CONSTRUCT",
    comment: `A CONSTRUCT clause allows you to describe a (new) graph based on a SPARQL query
result set.  A CONSTRUCT clause is itself a graph template.  For each result,
the template is filled out with any variables.  May also include “ground”
triples, i.e. those without variables.`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

WHERE($someone.knows.$anyone)
.CONSTRUCT(
  $someone.shouldVisit.$anyone, 
  $anyone.shouldVisit.$someone
)

`
  },

  {
    name: "sparql-describe",
    label: "SPARQL DESCRIBE",
    comment: `DESCRIBE means “give me information about these resources” from the matched set.
What information to include is up to the implementation.  I'll have more to say
about that anon.`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

WHERE($someone.isa.Person)
.DESCRIBE($someone)

`
  },

  {
    name: "traversal",
    label: "traversal driver",
    comment: `testing reified traversal`,
    userland_code: `Alice . knows . Bob
Bob . knows . Carol
// We would expect this traversal to include the above two facts
t . isa . XTraversal
t . startsFrom . Alice

x . hasClause . c
c . hasSubject . $knower
c . hasPredicate . knows
c . hasObject . $knowee

t2 . isa . Traversal
t2 . startsFrom .x

`
  },

  {
    name: "blank-nodes",
    label: "blank nodes",
    comment: `blank nodes (a.k.a bnodes) are anonymous resources.  They are critical to the
expression of compound structures in RDF, because you don't want to have to
explicitly name everything.  Blank nodes are created when the system generates a
node for some reason`,
    userland_code: `// blank nodes 
isa . Person

// or for the literal form:
// TBD, not supported yet!
hasStrength(50)

// you can also use them in place of where a node would go
// TBD, not supported yet!
space . hasForce ( x(50) )

`
  },

  {
    name: "subscription-cycle",
    label: "circular subscription",
    comment: `circular subscriptions should be okay as long as they are async`,
    userland_code: `Alice . listensTo . Bob
Bob . listensTo . Carol
Carol . listensTo . Alice

`
  },

  {
    name: "projection",
    label: "project over",
    comment: `Support assertion of a link between any given resource and the expansion of a set.`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)
Frank . projectOver . x
foob . isa . Container

`
  },

  {
    name: "containers",
    label: "container driver",
    comment: `declarative control over containment of things`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)
something . contains . x
blue .isa.Container
brown .isa.Container
blue.contains.x

`
  },

  {
    name: "selection",
    label: "resource selection",
    comment: `collect the resources named in a selection`,
    userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)

`
  },

  {
    name: "forcefield",
    label: "forcefield driver",
    comment: `testing reified forcefield (with query shorthand)`,
    userland_code: `Alice . knows . Bob
space.isa.Forcefield
space.hasForce.center
space.hasForce.charge
center.isa.forceCenter
charge.isa.forceManyBody
charge.strength(-200)
charge.distanceMax(250)
charge.theta(0.98)
//space.hasBodies(query(Alice.knows.$person))
space.hasBodies(query($subject.$predicate.$object))
// ticker . hasInterval(500)
ticker . isa . RAF
space.hasTicks.ticker

`
  },
  {
    name: "forcefield-verbose",
    label: "forcefield driver",
    comment: `testing reified forcefield`,
    userland_code: `Alice . knows . Bob
space.isa.Forcefield
space.hasForce.center
space.hasForce.charge
center.isa.forceCenter
charge.isa.forceManyBody
charge.strength(-200)
charge.distanceMax(250)
charge.theta(0.98)
space.hasBodies.q
q . hasClause . clause1
clause1 . hasSubject . Alice
clause1 . hasPredicate . knows
clause1 . hasObject . $y

//query(Alice.knows.$person)

`
  },

  {
    name: "representation",
    label: "representation driver",
    comment: `testing reified representations`,
    userland_code: `Alice . knows . Bob

`
  },

  {
    name: "rules",
    label: "rule driver",
    comment: `testing reified rules`,
    userland_code: `rule1 . hasCondition . p1
rule1 . hasConsequent . c1
p1 . hasClause . pclause1
c1 . hasClause . cclause1
pclause1 . hasSubject . $x
pclause1 . hasPredicate . loves
pclause1 . hasObject . $y
cclause1 . hasSubject . $x
cclause1 . hasPredicate . likes
cclause1 . hasObject . $y

`
  },

  {
    name: "queries",
    label: "query driver",
    comment: `testing reified queries`,
    userland_code: `query1 . isa . Query
clause1 . isa . Clause
clause1 . hasSubject . Alice
clause1 . hasPredicate . knows
clause1 . hasObject . $someone

clause2 . isa . Clause
clause2 . hasSubject . $someone
clause2 . hasPredicate . isa
clause2 . hasObject . Person

query1 . hasClause . clause1
query1 . hasClause . clause2
Alice.listensTo.query1
Alice.hostOutput("Alice")
`
  },

  {
    name: "layers",
    label: "layers driver",
    comment: `testing reified layers`,
    userland_code: `l . isa . Layer`
  },
  {
    name: "space",
    label: "space driver",
    comment: `testing reified space`,
    userland_code: `s . isa . Space`
  },

  {
    name: "forall",
    label: "forall macro",
    comment: `this may become a thing`,
    userland_code: `//forall(t, isa.Selected)
//forall(subgraph(forceCollide, subclassOf), isa.Selected)

`
  },
  // TODO: interpreter macros
  {
    name: "classes",
    label: "organizing classes",
    comment: `rules for representing the graph of defined classes`,
    userland_code: `
sc.connects.subclassOf
sc.isa.forceLink
space.hasForce.sc
sc.strength(.8)
sc.distance(500)

forall(subgraph(forceCollide, subclassOf), isa.Selected)

${SPACE_COMMON}
`
  },

  {
    name: "blank",
    label: "blank slate",
    comment: `type to see`,
    userland_code: `sc.connects.subclassOf
sc.isa.forceLink
space.hasForce.sc

${SPACE_COMMON}
`
  },

  {
    name: "forall",
    label: "forall macro",
    comment: `assert properties about subjects`,
    userland_code: `forall([Alice, Bob], isa.Person)
foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo

${SPACE_COMMON}
`
  },

  {
    name: "property-domain",
    label: "property domain",
    comment: `The domain of a property lets you infer the type of the subject in statements that use it.`,
    userland_code: `teaches.domain.Teacher
Alice.teaches.Bob
// so Alice is a Teacher
`
  },

  {
    name: "property-range",
    label: "property range",
    comment: `The range of a property lets you infer the type of the object in statements that use it.`,
    userland_code: `teaches.range.Student
Alice.teaches.Bob
// so Bob is a Student
`
  },

  {
    name: "inverse-properties",
    label: "inverse properties",
    comment: `Properties are directional.  Inverse properties let you give names to the “same” property in either direction.`,
    userland_code: `Alice.defeated.Bob
wasDefeatedBy.inverseOf.defeated

Bob.respects.Alice
respects.inverseOf.isRespectedBy
`
  },

  {
    name: "symmetric-properties",
    label: "symmetric properties",
    comment: `A symmetric property is one that is always mutually true of its subject and object.  That is, it always applies in both directions`,
    userland_code: `Alice.isMarriedTo.Carol
isMarriedTo.isa.SymmetricProperty
`
  },

  {
    name: "transitive-properties",
    label: "transitive properties",
    comment: `Relationships are not transitive unless you explicitly say so.`,
    userland_code: `Alice.isTheBossOf.Bob
Bob.isTheBossOf.Carol
isTheBossOf.isa.TransitiveProperty
`
  },

  {
    name: "subclasses",
    label: "subclasses",
    comment: `Subclass relationships let you refine and specialize types.`,
    userland_code: `Bob.isa.Square
Square.subclassOf.Shape
`
  },

  {
    name: "subproperties",
    label: "subproperties",
    comment: `Subproperty relationships let you refine and specialize properties.  Whatever is true of a property is also true of its subproperties.`,
    // ^ is that correct, or is it just true that s P o implies s P' o?
    userland_code: `wrote.subpropertyOf.created
Fitzgerald.wrote.TheGreatGatsby
// Fitzgerald created TheGreatGatsby
`
  },

  {
    name: "subgraph",
    label: "subgraph selection",
    comment: `do an exhaustive search`,
    userland_code: `Alice . knows . Bob
Bob . knows . Carol
Carol . knows . Jake
Jake . knows .  Carol
Jake . knows .  Miriam
Miriam . knows .  Alice
Miriam . knows .  Bob

forall(subgraph(Alice, knows), isa.Selected)

foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo
${SPACE_COMMON}
`
  },
  {
    name: "mesh-macro",
    label: "make a mesh",
    comment: `create a mesh of blank nodes`,
    userland_code: `mesh(3, 3)
//range(10)

foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo

${SPACE_COMMON}
`
  },
  {
    name: "code-in-world",
    label: "simple claims",
    comment: `testing expression reader`,
    userland_code: `Alice.loves.Bob
Bob.likes.Alice

${SPACE_COMMON}

`
  },
  {
    name: "boggle",
    label: "boggle with solutions",
    comment: `the full boggle example, with path search`,
    userland_code: `// board = boggle_grid(10, 10)
// set of search?
// etc
`
    /*
    async get_store() {
      const boggle_graph = random_board(BOARD_SIZE);
      const trie = await get_trie();
      const solutions = await solve(trie, boggle_graph);

      const ids = tx.transduce(
        tx.map(key => [key, mint_blank()]),
        tx.assocObj(),
        Object.keys(boggle_graph.nodes)
      );

      const solution_paths = solutions.map(_ => _[0]);
      const store = make_store();
      store.into(
        tx.map(
          ([s, o]) => trip(ids[s], "value", o),
          Object.entries(boggle_graph.nodes)
        )
      );

      store.into(
        tx.mapcat(
          ([s, targets]) =>
            tx.map(o => trip(ids[s], "linksTo", ids[o]), targets),
          Object.entries(boggle_graph.edges)
        )
      );
      return store;
    }
*/
  },
  /*
  {
    name: "trie-view-level-1",
    label: "trie level one",
    comment: `show the first node of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data)
            )
          },
          edges: { root: Object.keys(trie.data) }
        },
        paths: []
      };
    }
  },
  {
    name: "trie-view-level-2",
    label: "trie level two",
    comment: `show the first two levels of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            ),
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              tx.mapcat(
                k =>
                  Object.keys(trie.data[k])
                    .filter(k => k.length === 1)
                    .map(k2 => k + k2),
                Object.keys(trie.data).filter(k => k.length === 1)
              )
            )
          },
          edges: {
            root: Object.keys(trie.data),
            ...tx.transduce(
              tx.map(k => [
                k,
                Object.keys(trie.data[k])
                  .filter(k => k.length === 1)
                  .map(k2 => k + k2)
              ]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            )
          }
        },
        paths: []
      };
    }
  },
*/
  {
    name: "trie-prefix-1",
    label: "trie match 1",
    comment: `matching a term against trie`,
    userland_code: `// trie = willshake_words
// trie match/scan "qpoinspr"
// trie match/scan "hello"
// trie match/scan "world"
// trie node looks like render_trie_node
`
  },
  {
    name: "graph2",
    label: "testing another graph",
    comment: `an example graph`,
    userland_code: `
a . value . Alice
b . value . Bob
c . value . Carol
d . value . Dave
a . linksTo . b
a . linksTo . c
b . linksTo . d

${SPACE_COMMON}
`
  },
  {
    name: "graph3",
    label: "sequence as graph",
    comment: `turn a sequence into a graph`,
    userland_code: `list(Alice, Bob, Carol, Dave, Elon, Fran)

${SPACE_COMMON}

`
  },

  {
    name: "range-1",
    label: "integer range",
    comment: `a range from zero up to the number`,
    userland_code: `range(10)

${SPACE_COMMON}

`
  },
  {
    name: "cycle-1",
    label: "list cycle",
    comment: `make a list of the items with a linked head and tail`,
    userland_code: `range(10)

${SPACE_COMMON}

`
  },
  {
    name: "graph4",
    label: "sequence as graph cycle",
    comment: `turn a sequence into a loop in a graph`,
    userland_code: `a = range(10)
b = cycle(a)
`
  },
  {
    name: "graph5",
    label: "two separate structures on a graph",
    comment: `union of two independent generated sequences`,
    userland_code: `cycle(range(10))
range(20, 25)
`
  }
];
