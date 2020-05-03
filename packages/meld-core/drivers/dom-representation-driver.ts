// Attempt at a driver for rule-based representations.
// Probably not quite feasible with current rule support
import rdf from "@def.codes/rdf-data-model";
// re def:matches:
// moves the complexity to the assertion evaluation
// but gives an automatic syntax for
// - id assertions (?)
// - element assertions
// - class assertions (which are non-conflicting)
// - attribute value assertions
//   - including "contains" (for token list), which are non-conflicting
// - multiple assertions
// - :first-child / :last-child??? nth-child?? could be interesting though pointlessly crazy
// - ignoring everything else (:not(), descendant, sibling, etc)
// - still need another approach for has text/template

const n = rdf.namedNode;
const l = rdf.literal;

const MATCHES = n("def:matches");

export default {
  name: "domRepresentationDriver",
  init: ({ q }) => ({
    claims: q(),
    rules: [
      {
        name: "RDFaResourceRule",
        when: q("?rep isa def:DomElement", "?rep def:represents ?thing"),
        // TODO: s/b in filter
        then: ({ rep, thing }) =>
          thing.termType === "NamedNode"
            ? { assert: [[rep, MATCHES, l(`[resource="${thing.value}"]`)]] }
            : {},
      },
      {
        name: "RDFaPropertyRule",
        when: q(
          "?rep isa def:DomElement",
          "?rep def:represents ?thing",
          "?thing ?property ?value"
        ),
        // TODO: s/b in filter
        then: ({ rep, property, value }) =>
          value.termType === "Literal"
            ? {
                assert: [
                  // Could assert hasText vs (or in addition to) content
                  [rep, MATCHES, l(`[property="${property.value}"]`)],
                  [rep, MATCHES, l(`[content="${value.value}"]`)],
                ],
              }
            : {},
      },
      {
        // PROVISIONAL
        name: "SubscribableRepresentationRule",
        when: q(
          "?thing isa Subscribable",
          "?rep isa def:DomElement",
          "?rep def:represents ?thing",
          "?stream implements ?thing"
        ),
        then: ({ thing, rep, stream }) => {
          // Subscribe to the stream, or otherwise feed it to representation...
          console.log(`thing, rep, stream`, thing, rep, stream);

          return {};
        },
      },
    ],
  }),
};
