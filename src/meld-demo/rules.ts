// Scaffolding render rules

import { TraitQuery, DomTraitInterpreter } from "@def.codes/polymorphic-hdom";

interface RuleSet {
  queries: TraitQuery[];
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>;
}

export const RULES: RuleSet = {
  queries: [() => ({ id: "isa:Thing" })],
  interpreters: {
    "isa:Thing": () => [
      { type: "is-wrapped-by", wrap: _ => ["div", {}, "Hey I'm a thing", _] },
    ],
  },
};
