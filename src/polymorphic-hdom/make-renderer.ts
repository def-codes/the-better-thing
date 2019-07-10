import {
  DomTraitInterpreter,
  DomAssertion,
  Trait,
  TraitQuery,
  LiteralTemplate,
} from "./api";
import * as tx from "@thi.ng/transducers";

/*
  This renderer is “dynamic” in that different rule sets can yield essentially
  infinite variety of outputs.  However, it is still a (pure) synchronous
  function.  It does not assert any new facts during the course of evaluation,
  although it may ascertain classifications that are not explicit in the
  knowledge base *per se*.
*/

const is_truthy = (x: any): x is true => !!x;
const truthy = tx.filter(is_truthy);

const assertions_from = (
  thing: any,
  traits: Trait[],
  interpreters: Record<string, DomTraitInterpreter[]>
): DomAssertion[] => [
  ...tx.iterator(
    tx.comp(
      tx.map(trait => interpreters[trait.id]),
      truthy,
      tx.flatten(),
      tx.map(interpret => interpret(thing)),
      truthy,
      tx.flatten()
    ),
    traits
  ),
];

const template_from = (assertions: DomAssertion[]) => {
  let template: LiteralTemplate = [];
  const classes = new Set<string>();
  for (const assertion of assertions) {
    // destructively apply assertion
    switch (assertion.type) {
      case "contains":
        template.push(assertion.content);
        break;
      case "has-class":
        classes.add(assertion.class);
        break;
      case "is-wrapped-by":
        template = assertion.wrap(template);
        break;
      case "has-content-before":
      case "has-content-after":
        throw "Not supported";
      default:
      // do assert_unreachable
      // return ((type: never) => {
      //   throw `Unknown assertion ${type}`;
      // })(assertion.type);
    }
  }
  // TODO: what element to use tho
  return ["div", { class: [...classes].join(" ") }, template];
};

/** Return the traits imputed to a thing by a set of rules. */
const compute_all_traits = (
  queries: TraitQuery[],
  context,
  thing: any
): Trait[] => [
  ...tx.iterator(
    tx.comp(tx.map(query => query(thing, context)), truthy, tx.flatten()),
    queries
  ),
];

/** Create an HDOM render function using the given rules and interpreters. */
export function make_renderer(
  queries: TraitQuery[],
  interpreters: Record<string, DomTraitInterpreter[]>
) {
  // TODO:push context during navigation, so you need to trap it.  Also pass it
  // to fn's
  const context = [];

  return ({ render }, thing) => {
    // ^ but that's this?!

    // should have a new context here...
    // what is the context for?
    // key path that's been traversed...

    const traits = compute_all_traits(queries, context, thing);
    const dom_assertions = assertions_from(thing, traits, interpreters);
    return template_from(dom_assertions);
  };
}
