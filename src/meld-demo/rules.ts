// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";
import * as tx from "@thi.ng/transducers";

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

export const RULES: RuleSet = {
  queries: [
    () => ({ id: "Thing" }),
    // Except that we don't want to do this sort of thing, we want to go by
    // datafiable, namespaced keys.
    value =>
      value &&
      typeof value[Symbol.iterator] === "function" && { id: "Iterable" },
  ],
  interpreters: {
    Thing: () => [
      { type: "is-wrapped-by", wrap: _ => ["div", {}, "Hey I'm a thing", _] },
    ],
    Iterable: () => [
      {
        type: "contains",
        content: ({ show }, thing) => [
          "p",
          "I'm an iterable",
          "I mean just look at my things:",
          // " typeof show ",
          // typeof show,
          // " typeof thing ",
          // typeof thing,
          // " Array.isArray(thing) ",
          // Array.isArray(thing),
          // " JSON.stringify(thing) ",
          // JSON.stringify(thing),
          tx.map(item => [show, item], thing),
        ],
      },
    ],
  },
};
