define(["@def.codes/rstream-query-rdf", "@def.codes/meld-core"], (
  rdf,
  core
) => {
  const { factory, Dataset, UnionGraph } = rdf;
  const { q } = core;
  const { namedNode: n } = factory;
  const dataset = new Dataset();

  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  (async function () {
    const given = dataset.create_graph();
    given.graph.into(
      q(
        "Alice hates Bob",
        "Bob loves Alice",
        "Alice isa Woman",
        "Bob isa Man",
        "Woman subclassOf Person"
      )
    );
    const owned = dataset.create_graph();
    owned.graph.into(
      q(
        "Shera isa Dog",
        "Dog subclassOf Mammal",
        "Mammal subclassOf Animal",
        "Alice isa Woman"
      )
    );
    const hybrid = new UnionGraph(given.graph, owned.graph);
    console.log(`BEFORE`, [...hybrid.triples]);
    hybrid
      .addQueryFromSpec({ q: [{ where: [["?thing", n("isa"), "?type"]] }] })
      .subscribe({
        next: matches =>
          console.log(
            "matches",
            ...Array.from(matches, _ => `${_.thing} isa ${_.type}\n`)
          ),
      });

    await timeout(1000);

    given.graph.into(q("Flipper isa Dolphin", "Dolphin subclassOf Mammal"));
    console.log(`AFTER ADDING GIVEN`, [...hybrid.triples]);

    await timeout(1000);

    owned.graph.into(q("Jesus isa Sailor", "Alice isa Woman"));
    console.log(`AFTER ADDING OWN`, [...hybrid.triples]);
  })();
});
