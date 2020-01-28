const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");
const { DOT } = require("@def.codes/graphviz-format");

const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

const triples = q("A B C");
const store = new RDFTripleStore(triples);

exports.display = {
  dot_statements: show.dot(store, {
    // edge_label: [],
    annotate: [
      {
        construct: prep(`?n dot:color "red"`),
        where: prep("?n def:represents A"),
        // where: prep("?n a dot:Node"),
      },
    ],
  }),
};
