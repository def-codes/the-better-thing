// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";
import * as tx from "@thi.ng/transducers";

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

export const RULES: RuleSet = {
  queries: [
    // This is an implicit type, being OWL's uberclass.
    () => ({ id: "Thing" }),
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
  interpreters: {
    Quoted: () => ({ type: "is-wrapped-by", wrap: _ => ["q", _] }),

    Thing: () => [
      // Would normally be implicit by having type map to class.  But for thing,
      // maybe won't reify each case.
      { type: "has-class", class: "Thing" },
    ],
    Iterable: () => [
      {
        type: "contains",
        content: ({ show }, thing) => [
          "p",
          "I'm an iterable",
          ["p", "I contain these parts:"],
          // The context here is as a contained item.  It is not the preferred
          // place to fully show a resource.
          ["ul", {}, tx.map(item => ["li", [show, item]], thing)],
        ],
      },
    ],
  },
};
