// initial tests for backward chaining
const show = require("./lib/show");
const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { MND_LOVE } = require("./graphs/simple");

const { RDFTripleStore } = require("@def.codes/rstream-query-rdf");

// or should store be given?
const backward_chain_from_construct = input => {
  const { goal, resources, constructs } = input;
  const resources_store = new RDFTripleStore(resources);
  const output = {};

  return { input, resources_store, output };
};

const MUTUAL_LOVE_HAPPY = [
  {
    comment: `If someone is involved in mutual love, then they are happy`,
    // redundant to assert for y as well
    construct: q("?x a Happy"),
    where: q("?x loves ?y", "?y loves ?x"),
  },
];

const TEST_CASES = [
  // presumably must be more complex than could be done by path query
  {
    label: "Is Hermia happy?",
    goal: q("Hermia a Happy"),
    resources: MND_LOVE,
    constructs: MUTUAL_LOVE_HAPPY,
  },
  {
    label: "Is Helena happy?",
    goal: q("Helena a Happy"),
    resources: MND_LOVE,
    constructs: MUTUAL_LOVE_HAPPY,
  },
  {
    goal: q(),
    resources: q(
      "pizzaCrust1 hasIngredient Water",
      "pizzaCrust1 hasIngredient Flour",
      "pizzaCrust1 hasIngredient OliveOil",
      "pizzaCrust1 hasIngredient Salt",
      "pieCrust1 hasIngredient Water",
      "pieCrust1 hasIngredient Flour",
      "pieCrust1 hasIngredient Butter",
      "pieCrust1 hasIngredient Sugar"
    ),
    // rules are construct rules for the moment
    constructs: [
      {
        construct: q("solution uses ?fixer", "solution fixes ?fixable"),
        where: q("?fixer fixes ?fixable"),
      },
    ],
  },
  {
    goal: q(),
    resources: q(
      "JSONParseConversion convertsFrom rdf:JSON",
      "JSONParseConversion convertsTo JSRuntimeObject"
    ),
    constructs: [
      {
        construct: q("solution uses ?fixer", "solution fixes ?fixable"),
        where: q("?fixer fixes ?fixable"),
      },
    ],
  },
  {
    // blank nodes in construct
    goal: q(),
    resources: q("Foo a Bar", "Bar fixes Baz", "Baz partOf Foo"),
    constructs: [
      {
        construct: q("_:solution uses ?fixer", "_:solution fixes ?fixable"),
        where: q("?fixer fixes ?fixable"),
      },
    ],
  },
];

function main(test_case) {
  const { input, resources_store, output } = backward_chain_from_construct(
    test_case
  );

  const statements = clusters_from({
    goal: show.triples(input.goal),
    resources: show.store(resources_store),
    rules: show.things(input.constructs),
    output: show.thing(output),
  });

  return {
    dot_graph: {
      directed: true,
      attributes: { label: test_case.label, labelloc: "t", rankdir: "LR" },
      statements,
    },
  };
}

exports.display = main(TEST_CASES[0]);
