// Provide hdom components for representing basic RDF constructs.
import * as tx from "@thi.ng/transducers";
import rdf from "@def.codes/rdf-data-model";
import { Term } from "@def.codes/rdf-data-model";

// TRANSITIONAL: still coupled to rstream-query
import * as rq from "@thi.ng/rstream-query";

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
    ? ["div.value-view", [render, { value: o.valueOf() }]]
    : o.value
];

export const render_triples = (
  _,
  // see note below
  { value: triples }: { value: Iterable<any> }
) => [
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

const all_values_for = (store: rq.TripleStore, subject, property) =>
  tx.iterator(
    tx.comp(
      tx.map(index => store.triples[index]),
      tx.filter(([, p]) => p === property),
      tx.pluck<any, Term>(2)
    ),
    store.indexS.get(subject) || []
  );

// given a store and a list of resources, render those resources and their
// (non-node) properties.
const render_resource_nodes = (
  _,
  { store, resources }: { store: rq.TripleStore; resources: Iterable<Term> }
) => {
  const literal_props: Map<Term, [Term, Term, Term][]> = tx.transduce(
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
