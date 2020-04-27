// TODO: This should not have path, should be relative to this
require(["./bootstrap-temp/meld-system.js"], ({ system }) => {
  const { dataset } = system;
  const { defaultGraph, factory } = dataset;

  const TYPE = factory.namedNode("rdf:type");
  const GRAPH = factory.namedNode("rdfg:Graph");

  // or make one, etc
  const root = document.querySelector("#named-graphs");

  defaultGraph
    .addQueryFromSpec({ q: [{ where: [["?s", TYPE, GRAPH]] }] })
    .subscribe({
      next(results) {
        // Assume it's not a blank node
        const iris = Array.from(results, _ => _.s.value);
        for (const iri of iris) {
          const selector = `graph=["${iri}"]`;
        }
        console.log(`results`, foo);
      },
    });

  const some_graph = dataset.create();

  // now what
  // give the system a model to interpret
  // where do you get that
  //
  // Every model is a graph, but not every graph is a model

  return;
});
