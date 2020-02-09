const show = require("./lib/show");
// const { clusters_from } = require("./lib/clustering");
const { q } = require("@def.codes/meld-core");
const { RDFTripleStore, factory } = require("@def.codes/rstream-query-rdf");
const { BinarySearchTree } = require("@def.codes/helpers");
const ConstructDot = require("./queries/construct-dot");

const { namedNode: n, blankNode: b, literal: l } = factory;
const TYPE = n("rdf:type");
const BINARY_TREE = n("def:BinaryTree");
const VALUE = n("rdf:value");
const NIL = n("rdf:nil");
const LEFT = n("bt:left");
const RIGHT = n("bt:right");

const { DOT } = require("@def.codes/graphviz-format");
const prep = (...cs) =>
  q(
    ...cs.map(_ =>
      _.replace(/dot:/g, DOT).replace(/(^|\s)a(\s|$)/g, "$1rdf:type$2")
    )
  );

// Ad-hoc code mapping binary tree directly to RDF triples
function* binary_tree_triples(tree, subject = b()) {
  yield [subject, VALUE, l(tree.value)];

  // Assert this to support rules based on positive conditions.
  // Could be inferred using restrictions on bt:left and :right.
  yield [subject, TYPE, BINARY_TREE];
  if (tree.left) {
    const left = b();
    yield [subject, LEFT, left];
    yield* binary_tree_triples(tree.left, left);
  } else yield [subject, LEFT, NIL];

  if (tree.right) {
    const right = b();
    yield [subject, RIGHT, right];
    yield* binary_tree_triples(tree.right, right);
  } else yield [subject, RIGHT, NIL];
}

// Ad-hoc code mapping binary tree directly to dot structures
let count = 0;
const dum = () => `d${count++}`;
function* temp_binary_tree_dot({ left, right, value: id }) {
  // avoid need for assigned id, since value is unique in search tree
  yield {
    type: "node",
    id,
    // Make circle relatively proportional to value
    // attributes: { width: (id / 20).toFixed(4) },
  };
  if (!left && !right) return;

  const make_dum = (label, to = dum(), style = "dotted", color = "gray") => [
    { type: "node", id: to, attributes: { style, color, fontcolor: color } },
    {
      type: "edge",
      from: id,
      to,
      attributes: { label, style, color, fontcolor: color },
    },
  ];
  // Dot seems to align L/R as expected if they appear in this order
  if (left) {
    yield {
      type: "edge",
      from: id,
      to: left.value,
      // attributes: { label: "L" },
    };
    yield* temp_binary_tree_dot(left);
  } else yield* make_dum("L");
  if (right) {
    yield {
      type: "edge",
      from: id,
      to: right.value,
      // attributes: { label: "R" },
    };
    yield* temp_binary_tree_dot(right);
  } else yield* make_dum("R");
}

const main = () => {
  const tree = new BinarySearchTree(50);
  const N = 200,
    M = 5;
  const rand = max => Math.floor(Math.random() * max);
  const rands = [];
  for (let n = 0; n < N; n++) rands.push(rand(200) - 100);
  const ns = [5, 9, 8, 77, 9, 73, -3, 34, 356, 19, 1];
  const nums = rands.slice(0, M);
  for (const n of nums) tree.insert(n);

  const store = new RDFTripleStore();
  const triples = [...binary_tree_triples(tree)];
  // store.into(q("a p b", "b p c", "c p b"));
  console.log(`triples`, triples);

  store.into(triples);

  const statements = show.store(store, {
    // Uses default for copy
    node: [
      {
        comment: "Represent all binary trees as nodes.",
        construct: prep(`_:tree a dot:Node`, `_:tree def:represents ?s`),
        where: prep(`?s a def:BinaryTree`),
      },
      {
        comment: `Give each nil instance its own representation.`,
        construct: prep(
          `?s ?p _:nil`,
          `_:dummy a dot:Node`,
          `_:dummy def:represents _:nil`,
          // Mark *node* in a way that you can detect later (but that doesn't
          // create new things to represent *per se*).
          `_:dummy special nil`
        ),
        where: prep(`?s ?p rdf:nil`),
      },
    ],
    // Uses default edge construction
    node_label: [
      {
        comment: `Label nodes by value (not id).  This would be a common rule.`,
        construct: prep(`?node dot:label ?value`),
        where: prep(`?node def:represents ?s`, `?s rdf:value ?value`),
      },
    ],
    edge_label: [], // don't label edges (override default)
    annotate: [
      {
        comment: "Distinguish nils",
        construct: prep(`?node dot:label ""`, `?node dot:width 0.1`),
        where: prep("?node special nil"),
      },
      {
        comment: "De-emphasize edges to nils",
        construct: prep(`?edge dot:style "dotted"`),
        where: prep("?edge dot:to ?node", "?node special nil"),
      },
    ],
  });
  // const statements = [...temp_binary_tree_dot(tree)];

  return {
    dot_graph: {
      node_attributes: { shape: "circle" },
      attributes: {
        // The default graph `rankdir` (TB) happens to be the traditional one
        // for binary tree notations.
        rankdir: "TB",
        label: nums.join(", ").slice(0, 100),
      },
      statements,
    },
  };
};

exports.display = main();
