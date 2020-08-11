define(["./rdf-names"], rn => {
  const rdf = rn.rdf; // should be built-in
  const rdfs = rn.rdfs; // should be built-in
  const meld = rn.meld; // should be built-in

  // TODO: change these to resources and annotate with
  // - label
  // - operator arity (unary, binary)
  // - spec: expected input type
  // - spec: output type (assuming input is as expected)
  // - math notation symbol (where applicable)
  // - URL to official reference
  // - URL for equivalent standard math operation
  // - comment saying what it is
  // - JS symbol for operator (so you could theoretically generate the code?)
  // -

  const rewritten = {
    // Some standard stuff
    "@context": {
      rdf: "",
      rdfs: "",
      meld: "https://def.codes/unk/meld/",
      describedBy: "rdf:describedBy",
      label: "rdfs:label",
      value: "rdf:value",
      comment: "rdfs:comment",
    },
    "@graph": [
      // We are talking here about the *JavaScript operator*
      // but the mathematical concept is related
      {
        // Not really... is there an id specifically for this operator?
        id: "https://tc39.es/ecma262/#sec-equality-operators",
        type: "meld:ECMAScriptOperator", // made up
        label: ["triple equals", "strict equality operator"],
        comment: "ECMAScript's strict equality operator",
        describedBy: [
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality",
          // This page talks about === in comparison with other related operators
          "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness",
        ],
        // This is the value of an implementation
        value: {
          "@value": "(a, b) => a === b",
          "@type": "meld:ECMAScriptCode",
        },
        // You can use this to build expressions
        [meld.ecmascriptToken]: "===",
        // The closest thing to a runtime value equivalent, since it is not reified.
        [meld.implementation]: (a, b) => a === b,
      },
    ],
  };

  return {
    // Ordinal
    EqualTo: (a, b) => a === b,
    GreaterThan: (a, b) => a > b,
    GreaterThanOrEqualTo: (a, b) => a >= b,
    LessThan: (a, b) => a < b,
    LessThanOrEqualTo: (a, b) => a <= b,
    // Logical
    LogicalNot: a => !a,
    LogicalAnd: (a, b) => !!(a && b),
    LogicalOr: (a, b) => !!(a || b),
    // Arithmetic
    plus: (a, b) => a + b,
    minus: (a, b) => a - b,
    times: (a, b) => a * b,
    divide: (a, b) => a / b,
    exponent: (a, b) => a ** b, // same as Math.pow
    // Bitwise
    BitwiseAnd: (a, b) => a & b,
    BitwiseOr: (a, b) => a | b,
    BiwtiseXor: (a, b) => a ^ b,
    // Trig
    // These are already built-ins
  };
});
