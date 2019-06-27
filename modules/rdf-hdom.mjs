// Provide hdom components for representing basic RDF constructs.

import rdf from "./rdf.mjs";

// Hack for browser/node support
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

// NOTE: This view (and any one using `render_value` now assumes that `render`
// is in context.)

const as_string = v => (v ? v.toString() : undefined);

const TYPE = rdf.namedNode("isa"); // s/b rdf:type

export const render_triple = ({ render }, { value: [s, p, o] }) => [
  "div.Property",
  {
    "data-subject": as_string(s.value),
    "data-property": as_string(p.value),
    "data-object": as_string(o.value)
  },
  s.value,
  " ",
  p.value,
  " ",
  o.termType === "Literal"
    ? ["div.value-view", [render, { value: o.value }]]
    : o.value
];

export const render_triples = (_, { value: triples }) => [
  "div.triples",
  "facts",
  tx.map(
    triple => [
      render_triple,
      // TRANSITIONAL: should always use rdf.js form unless directly
      // interoping with rstream-query.
      {
        value: Array.isArray(triple)
          ? triple
          : [triple.subject, triple.predicate, triple.object]
      }
    ],
    triples
  )
];

const all_values_for = (store, subject, property) =>
  tx.iterator(
    tx.comp(
      tx.map(index => store.triples[index]),
      tx.filter(([, p]) => p === property),
      tx.pluck(2)
    ),
    store.indexS.get(subject) || []
  );

// given a store and a list of resources, render those resources and their
// (non-node) properties.
const render_resource_nodes = (_, { store, resources }) => {
  const literal_props = tx.transduce(
    // Limit to literal (value) props, as nodes and links are displayed
    // independently.  Allows links to be on separate layer.
    tx.filter(([, , o]) => o.termType === "Literal"),
    tx.groupByMap({ key: ([s]) => s }),
    store.triples
  );

  return [
    "div",
    {},
    tx.map(
      resource => [
        "div",
        {
          "data-resource": resource.value,
          class: [
            "Resource",
            ...tx.map(
              type => type.value,
              all_values_for(store, resource, TYPE) || []
            )
          ].join("  ")
        },
        [
          "div.resource-content",
          resource.value,
          !literal_props.has(resource)
            ? null
            : tx.map(
                ([, p, o]) => [
                  "div",
                  { "data-property": p.value },
                  p.value,
                  " ",
                  o.value && o.value.toString()
                ],
                literal_props.get(resource)
              )
        ]
      ],
      resources
    )
  ];
};
