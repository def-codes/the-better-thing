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
    name: "forcefield",
    label: "forcefield driver",
    comment: `testing reified forcefield (with query shorthand)`,
    userland_code: `claim(
Alice . knows . Bob,
space.isa.Forcefield,
space.hasForce.center,
space.hasForce.charge,
center.isa.forceCenter,
charge.isa.forceManyBody,
charge.strength(-200),
charge.distanceMax(250),
charge.theta(0.98),
//space.hasBodies(query(Alice.knows.$person)),
space.hasBodies(query($subject.$predicate.$object)),
 ticker . hasInterval(500),
 space.hasTicks.ticker,

)
`
  },
  {
    name: "forcefield-verbose",
    label: "forcefield driver",
    comment: `testing reified forcefield`,
    userland_code: `claim(
Alice . knows . Bob,
space.isa.Forcefield,
space.hasForce.center,
space.hasForce.charge,
center.isa.forceCenter,
charge.isa.forceManyBody,
charge.strength(-200),
charge.distanceMax(250),
charge.theta(0.98),
space.hasBodies.q,
q . hasClause . clause1,
clause1 . hasSubject . Alice,
clause1 . hasPredicate . knows,
clause1 . hasObject . $y,
)
//query(Alice.knows.$person)

`
  },

  {
    name: "representation",
    label: "representation driver",
    comment: `testing reified representations`,
    userland_code: `claim(
Alice . knows . Bob
)
`
  },

  {
    name: "rules",
    label: "rule driver",
    comment: `testing reified rules`,
    userland_code: `claim(
rule1 . hasCondition . p1,
rule1 . hasConsequent . c1,
p1 . hasClause . pclause1,
c1 . hasClause . cclause1,
pclause1 . hasSubject . $x,
pclause1 . hasPredicate . loves,
pclause1 . hasObject . $y,
cclause1 . hasSubject . $x,
cclause1 . hasPredicate . likes,
cclause1 . hasObject . $y
)
`
  },

  {
    name: "queries",
    label: "query driver",
    comment: `testing reified queries`,
    userland_code: `claim(
query1 . isa . Query,
clause1 . isa . Clause,
clause1 . hasSubject . Alice,
clause1 . hasPredicate . knows,
clause1 . hasObject . $someone,
query1 . hasClause . clause1
)
`
  },

  {
    name: "streams",
    label: "streams driver",
    comment: `testing reified streams`,
    userland_code: `claim(
stream . isa . Stream, // (implicit)
stream . hasSource(sub => { sub.next("hello"); sub.next("world"); }),
sub . listensTo . stream
)
`
  },

  {
    name: "layers",
    label: "layers driver",
    comment: `testing reified layers`,
    userland_code: `claim(
l . isa . Layer
)
`
  },
  {
    name: "space",
    label: "space driver",
    comment: `testing reified space`,
    userland_code: `claim(
s . isa . Space
)
`
  },
  {
    name: "traversal",
    label: "traversal driver",
    comment: `testing reified traversal`,
    userland_code: `claim(
t . isa . Traversal,
t . startsFrom . forceCollide
)

forall(t, isa.Selected)

//forall(subgraph(forceCollide, subclassOf), isa.Selected)

claim(
${SPACE_COMMON}
)
`
  },

  {
    name: "classes",
    label: "organizing classes",
    comment: `rules for representing the graph of defined classes`,
    userland_code: `claim(
sc.connects.subclassOf,
sc.isa.forceLink,
space.hasForce.sc,
sc.strength(.8),
sc.distance(500),
)

forall(subgraph(forceCollide, subclassOf), isa.Selected)

claim(
${SPACE_COMMON}
)
`
  },

  {
    name: "blank",
    label: "blank slate",
    comment: `type to see`,
    userland_code: `// 
claim(
sc.connects.subclassOf,
sc.isa.forceLink,
space.hasForce.sc,
)





























claim(
${SPACE_COMMON}
)
`
  },

  {
    name: "forall",
    label: "forall macro",
    comment: `assert properties about subjects`,
    userland_code: `forall([Alice, Bob], isa.Person)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },

  {
    name: "subgraph",
    label: "subgraph selection",
    comment: `do an exhaustive search`,
    userland_code: `claim(
Alice . knows . Bob,
Bob . knows . Carol,
Carol . knows . Jake,
Jake . knows .  Carol,
Jake . knows .  Miriam,
Miriam . knows .  Alice,
Miriam . knows .  Bob
)
forall(subgraph(Alice, knows), isa.Selected)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },
  {
    name: "mesh-macro",
    label: "make a mesh",
    comment: `create a mesh of blank nodes`,
    userland_code: `mesh(3, 3)
//range(10)
claim(
foo.isa.forceLink,
foo.id(_ => _.id),
foo.connects.linksTo,
space.hasForce.foo,
${SPACE_COMMON}
)
`
  },
  {
    name: "code-in-world",
    label: "simple claims",
    comment: `testing expression reader`,
    userland_code: `claim(
Alice.loves.Bob,
Bob.likes.Alice,
${SPACE_COMMON}
)
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
claim(
a . value . Alice,
b . value . Bob,
c . value . Carol,
d . value . Dave,
a . linksTo . b,
a . linksTo . c,
b . linksTo . d,
${SPACE_COMMON}
)
`
  },
  {
    name: "graph3",
    label: "sequence as graph",
    comment: `turn a sequence into a graph`,
    userland_code: `list(Alice, Bob, Carol, Dave, Elon, Fran)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "symmetrical",
    label: "symmetrical property",
    comment: `a symmetrical property always applies in both directions`,
    userland_code: `claim(knows.isa.SymmetricalProperty)
rule({
  when: [$p.isa.SymmetricalProperty, $x.$p.$y],
  then: [$y.$p.$x]
})
claim(Alice.knows.Bob)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "range-1",
    label: "integer range",
    comment: `a range from zero up to the number`,
    userland_code: `range(10)
claim(
${SPACE_COMMON}
)

`
  },
  {
    name: "cycle-1",
    label: "list cycle",
    comment: `make a list of the items with a linked head and tail`,
    userland_code: `range(10)
claim(
${SPACE_COMMON}
)

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
