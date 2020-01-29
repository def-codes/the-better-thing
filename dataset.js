const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { Dataset } = require("@def.codes/rstream-query-rdf");

const dataset_to_dot_statements = dataset => {
  const dot_statements = clusters_from({
    _: show.store(dataset.defaultGraph),
    ...Object.fromEntries(
      Array.from(dataset.namedGraphs, ([name, store]) => [
        name.toString(),
        show.store(store),
      ])
    ),
  });

  return dot_statements;
};

const main = () => {
  const dataset = new Dataset();
  const { factory } = dataset;

  const { namedNode: n, blankNode: b, literal: l } = factory;

  // add stuff to default graph
  dataset.defaultGraph.add([n("a"), n("p"), l("FOO")]);

  // create a named graph
  const world1 = dataset.create();
  world1.add([n("don"), n("loves"), n("don")]);

  // create another named graph
  const world2 = dataset.create();
  world2.add([n("don"), n("loves"), n("us")]);

  const dot_statements = dataset_to_dot_statements(dataset);

  return { dot_statements };
};

exports.display = main();
