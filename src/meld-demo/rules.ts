// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";
import * as tx from "@thi.ng/transducers";

const co = "Collections Ontology";

// Describe
const something = {
  // "is a part of" is just rdf:label for co:hasPart (that you can define)
  // How to say this property in a self-referential way
  // I have this part
  // [`${co}hasPart`]: ({ Name }, subject) => [[Name, subject], "is a part of"],
};

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

// Let's guarantee that `thing` is not nullish in these handlers, I.e. do the
// test before calling a composition of them.  It's redundant and irrelevant.
export const RULES: RuleSet = {
  queries: [
    thing => typeof thing.id === "string" && { id: "Identifiable" },
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
    // These need to be situated to HTML/hdom context.
    Navigable: thing => [
      // You want to assert these things about the label, right?
      { type: "has-element", tag: "a" },
      { type: "attribute-includes", key: "href", value: thing.href },
    ],

    Identifiable: thing => ({
      type: "attribute-includes",
      key: "id",
      value: thing.id,
    }),

    Dictionary: [
      (/* What is here? */) => [
        {
          type: "contains",
          // Again with the pointless div... this is still not right
          content: () => ({ Entries }, dict) => [
            "div",
            { class: "Entries" },
            [Entries, dict],
            JSON.stringify(dict),
          ],
        },
      ],
    ],

    // All types translate to class. Should be issued once for each type
    // a.k.a. isa, a.k.a. a
    "rdf:type": [({ type }) => [{ type: "has-class", class: type }]],
    id: [({ id }) => ({ type: "attribute-includes", key: "id", value: id })],

    OrderedCollection: () => ({ type: "has-element", tag: "ol" }),
    UnorderedCollection: { type: "has-element", tag: "ul" },

    Link: () => ({ type: "has-element", tag: "a" }),
    Label: () => ({ type: "has-element", tag: "label" }),
    Figure: () => ({ type: "has-element", tag: "figure" }),
    Symbol: () => ({ type: "has-element", tag: "code" }),
    Keyword: () => ({ type: "has-element", tag: "code" }),
    Quoted: () => ({ type: "has-element", tag: "q" }),
    Quotation: () => ({ type: "has-element", tag: "blockquote" }),

    // Normally implicit, but ‘Thing’ may not be reified for all instances.
    Thing: () => [{ type: "has-class", class: "Thing" }],

    //
    // But are we matching before or after the datafication?  After.  The
    // datafication comes first.  When you are the subject, that's all you know.
    //
    // In JSON-LD it is a textual term name
    //
    // we want to be able to say -- in a general way --
    // that when something is identifiable, (we'll assume URL)
    // that an element representing it should bear its id.
    // ever aware that there could be more than one such thing
    // it's perfectly legal, and it can happen
    //
    // then we can say that it is wrapped in a link to itself?
    //

    //But how do you get list item?  You'd have to know context.
    //But... templates using those elements should emit li's.

    // ListItem: () =>
    //   `iiiiiiiis not going to be a type, exactly.  well you could say belongstocontainer`,
    //
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
          "I'm one lucky iterable",
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
