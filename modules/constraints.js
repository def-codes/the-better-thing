/*
  Patterns, shapes, constraints.

  STATUS: sketch

  Related to Clojure spec SHACL, and various pattern-matching schemes.

  

 */
define(["./rdf-names"], rn => {
  const sp = rn("http://def.codes/unk/pattern-matching");

  // Reification / definition the parts of the language.
  return {
    [sp.and]: {
      label: "provisional spec conjunction",
      comment: ["provisional spec AND operator", ""],
      [sp.key]: "$and",
    },
    [sp.or]: {
      comment: [
        "provisional spec OR operator",
        "should be tagged, or tagging optional?",
      ],
      [sp.key]: "$or",
    },
  };
});
