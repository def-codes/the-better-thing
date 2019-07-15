// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";
import * as tx from "@thi.ng/transducers";

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

export const RULES: RuleSet = {
  queries: [
    thing => Array.isArray(thing) && { id: "Vector" },
    thing => thing && typeof thing === "object" && { id: "Dictionary" },

    // This is an implicit type, being OWL's uberclass.
    () => ({ id: "Thing" }),

    // Map all reported types to traits
    thing =>
      thing &&
      (Array.isArray(thing["@type"])
        ? thing["@type"].map(id => ({ id }))
        : thing["@type"]
        ? { id: thing["@type"] }
        : null),

    // Iterable
    // Except that we don't want to do this sort of thing, we want to go by
    // datafiable, namespaced keys.
    thing =>
      thing &&
      // Special exception for string to avoid infinite recursion... :/
      typeof thing !== "string" &&
      typeof thing[Symbol.iterator] === "function" && { id: "Iterable" },

    // Again, we can extend prototypes to assign type
    thing => thing && typeof thing === "string" && { id: "Quoted" },
  ],

  // So, if datafy / nav should issue a key and value representing a dynamic
  // navigation/operation (like keys/values/entries), that can be afforded as data.
  // Representations of those subpaths are bound to their contexts.

  // Testing of proxy-based interpreter context.
  interpreters: {
    Dictionary: [
      () => [
        {
          type: "contains",
          content: () => ({ Entries }, dict) => [
            "div.Entries",
            {},
            [Entries, dict],
            JSON.stringify(dict),
          ],
        },
      ],
    ],

    // All types translate to class. Should be issued once for each type
    // a.k.a. isa, a.k.a. a
    "rdf:type": [({ type }) => [{ type: "has-class", class: type }]],

    OrderedCollection: () => ({ type: "has-element", tag: "ol" }),

    UnorderedCollection: { type: "has-element", tag: "ul" },
    Quoted: () => ({ type: "has-element", tag: "q" }),

    // Normally implicit, but ‘Thing’ may not be reified for all instances.
    Thing: () => [{ type: "has-class", class: "Thing" }],

    // In the event that something reports more than one type and has multiple
    // protocol implementations... undefined ATM
    Vector: () => ({
      type: "contains",
      content: ({ show }, thing) => [
        "span",
        ["b", "size"],
        thing.length,
        "(",
        [show, thing.length],
        ")",
      ],
    }),

    // second inspection only extends the first
    Iterable: () => [
      {
        type: "contains",
        content: ({ show }, thing) => [
          "p",
          "I'm an iterable",
          ["p", "I contain these parts:"],
          // JUST INDICATE TYPE OF EACH ITEM.... HOW
          ["ul", {}, tx.map(item => ["li", [show, item]], thing)],
        ],
      },
      {
        type: "contains",
        content: ({ show }, thing) => [
          "div",
          "I'm also an iterable",
          ["p", "I contain these parts:"],
        ],
      },
    ],
  },
};
