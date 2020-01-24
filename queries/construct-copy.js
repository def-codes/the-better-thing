const { q } = require("@def.codes/meld-core");

exports.Copy = {
  // This clause can be elided in SPARQL
  where: q("?s ?p ?o"),
  construct: q("?s ?p ?o"),
};
