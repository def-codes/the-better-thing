// ecmascript
exports.ecmascript_example = [
  // classes
  ["es:Function", "a", "rdf:Class"],
  ["es:argumentList", "rdf:domain", "es:Function"],
  ["es:argumentList", "rdf:domain", "es:Function"],
  // instances
  ["sqrt", "a", "es:Function"],
  ["sqrt", "rdf:value", Math.square],
  ["sqrt", "rdfs:comment", "Calculates the square root of its input."],
  ["sin", "a", "es:Function"],
];

// graphviz.  a lot of this is in types in graphviz-format
exports.example_domain_2 = [
  // classes
  ["gv:", "a", "Class"],
  // instances
  [],
];
