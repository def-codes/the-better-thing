// Partial mapping of SPARQL to rstream-query.
//
// This is NOT for the SPARQL language, but for the SPARQL vocabulary, as
// represented by RDF. To wit, the closest thing to an “official” such
// vocabulary is SPIN: https://spinrdf.org/sp.html
//
// Yet they do mention that this differs (slightly) from “the official W3
// submission.”
//
// It's noted here that SPIN uses order-preserving statement representation
// https://github.com/RDFLib/rdflib/issues/483
// That is separately interesting, topic of graph canonicalization
// https://lists.w3.org/Archives/Public/semantic-web/2015May/0097.html
// http://cui.unige.ch/isi/icle-wiki/_media/cours:sw:rdf-s_semantics.pdf
(function() {
  const NAME = "sparqlDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      // graph pattern
      // where
      // result clauses (disjunct)
      // - select
      // - construct
      // - describe
      // - ask (not implemented)
      ""
    ),
    rules: [

    ]
  }));
})();
