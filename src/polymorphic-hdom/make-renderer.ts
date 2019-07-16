import {
  DomTraitInterpreter,
  DomAssertion,
  Trait,
  TraitQuery,
  LiteralTemplate,
} from "./api";
import { datafy } from "@def.codes/datafy-nav";
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
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>
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
  return (_context, subject) => {
    const attributes = Object.create(null);
    const classes = (attributes.classes = new Set<string>());
    let tag: string,
      template: LiteralTemplate = [];
    // const classes = new Set<string>();
    for (const assertion of assertions) {
      // destructively apply assertion
      switch (assertion.type) {
        case "contains":
          template.push([assertion.content, subject]);
          break;
        case "attribute-includes":
          attributes[assertion.key] = attributes[assertion.key]
            ? assertion.value + " " + attributes[assertion.key]
            : assertion.value;
          break;
        case "has-element":
          if (tag === undefined) tag = assertion.tag;
          else console.log(`Cohabitating definitions for`, tag);
          break;
        case "has-class":
          classes.add(assertion.class);
          break;
        case "is-wrapped-by":
          template = assertion.wrap(template);
          break;
        // case "has-content-before":
        // case "has-content-after":
        //   throw "Not supported";
        default:
        // do assert_unreachable
        // return ((type: never) => {
        //   throw `Unknown assertion ${type}`;
        // })(assertion.type);
      }
    }
    return [tag || "div", { class: [...classes].join(" ") }, template];
  };
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
// Context is consistent throughout render
export const make_renderer = (
  queries: TraitQuery[],
  interpreters: Record<string, DomTraitInterpreter | DomTraitInterpreter[]>
) => (context, thing: unknown) => {
  const datafied = datafy(thing);
  // console.log(`datafied`, datafied);

  return [
    template_from(
      assertions_from(
        thing,
        compute_all_traits(queries, context, datafied),
        interpreters
      )
    ),
    thing,
  ];
};
