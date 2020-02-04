const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { Dataset } = require("@def.codes/rstream-query-rdf");

const { DOT } = require("@def.codes/graphviz-format");
const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

const dataset_to_dot_statements = dataset => {
  const dot_statements = clusters_from({
    _: show.store(dataset.defaultGraph),
    ...Object.fromEntries(
      Array.from(dataset.namedGraphs, ([name, store]) => [
        name.toString(),
        show.store(store, {
          annotate: [
            {
              construct: prep(
                `?node dot:style "filled"`,
                `?node dot:color ?color`
              ),
              where: prep("?color a Color", "?node def:represents ?color"),
            },
            {
              construct: prep(
                // `?edge dot:style "invis"`,
                `?edge dot:constraint false`
              ),
              where: prep(
                "?t rdf:predicate rdf:type",
                "?edge def:represents ?t"
              ),
            },
          ],
        }),
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

  // create yet another named graph
  const colors_world = dataset.create();
  for (const color of "red orange yellow green blue indigo violet".split(" "))
    colors_world.add([n(color), n("rdf:type"), n("Color")]);

  const dot_statements = dataset_to_dot_statements(dataset);

  return { dot_statements };
};

exports.display = main();
