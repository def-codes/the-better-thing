const { q } = require("@def.codes/meld-core");

exports.OneTriple = q("a p b");
exports.OneTripleWithVariable = q("a p ?b");
exports.OneTripleWithSubjectBnode = q("_:a p b");
exports.OneTripleWithObjectBnode = q("a p _:b");

exports.TwoTriplesUnrelated = q("a p b", "c q d");
exports.TwoTriplesWithCommonPredicate = q("a p b", "c p d");
exports.TwoTriplesWithCommonSubject = q("a p b", "a q d");
exports.TwoTriplesWithCommonObject = q("a p b", "c q b");

exports.VariousBlankNodes = q(
  "_:A b C",
  "_:D e _:F",
  "_:G h I",
  "C z _:D",
  "_:G z C"
);

exports.VariousBlankNodesSlightDifference = q(
  "_:A b C",
  "_:d e _:F",
  "_:g h I",
  "C z _:d",
  "_:g z C"
);

exports.LOVE_TRIANGLE = q(
  "Bob loves Alice",
  "Alice loves Carol",
  "Carol loves Bob"
);

exports.MND_LOVE = q(
  "Demetrius loves Hermia",
  "Helena loves Demetrius",
  "Lysander loves Hermia",
  "Hermia loves Lysander"
);
