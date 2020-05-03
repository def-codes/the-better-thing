// Attempt at a driver for rule-based representations.
// Probably not quite feasible with current rule support
import rdf from "@def.codes/rdf-data-model";

const n = rdf.namedNode;
const b = rdf.blankNode;
const l = rdf.literal;

const ISA = n("isa");
const REPRESENTS = n("def:represents");
const DOM_ELEMENT = n("def:DomElement");
const ATTRIBUTE_CONTAINS = n("def:attributeContains");
const ATTRIBUTE_NAME = n("def:attributeName");
const ATTRIBUTE_VALUE = n("def:attributeValue");

export default {
  name: "domRepresentationDriver",
  init: ({ q, is_node }) => ({
    claims: q(),
    rules: [
      {
        name: "RDFaResourceRule",
        when: q("?rep isa def:DomElement", "?rep def:represents ?thing"),
        then: ({ rep, thing }) => {
          // See below
          // TODO: s/b in filter
          if (thing.termType === "NamedNode") {
            const id = b();
            return {
              assert: [
                [rep, ATTRIBUTE_CONTAINS, id],
                [id, ATTRIBUTE_NAME, l("resource")],
                [id, ATTRIBUTE_VALUE, l(thing.value)],
              ],
            };
          }
          return {};
        },
      },
      {
        name: "RDFaPropertyRule",
        when: q(
          "?rep isa def:DomElement",
          "?rep def:represents ?thing",
          "?thing ?property ?value"
        ),
        then: ({ rep, property, value }) => {
          // TODO: s/b in filter
          if (value.termType === "Literal") {
            // I'm tempted to say
            // rep def:matches `[${property.value}="${value.value}"]`
            // That would move the complexity to the assertion evaluation
            // But it would give an automatic syntax for
            // - id assertions (?)
            // - element assertions
            // - class assertions (which are non-conflicting)
            // - attribute value assertions
            //   - including "contains" (for token list), which are non-conflicting
            // - multiple assertions
            // - :first-child / :last-child??? nth-child?? could be interesting though pointlessly crazy
            // - ignoring everything else (:not(), descendant, sibling, etc)
            const prop = b();
            const val = b();
            return {
              assert: [
                [rep, ATTRIBUTE_CONTAINS, prop],
                [prop, ATTRIBUTE_NAME, l("property")],
                [prop, ATTRIBUTE_VALUE, l(property.value)],
                // Or contains text
                [rep, ATTRIBUTE_CONTAINS, val],
                [prop, ATTRIBUTE_NAME, l("content")],
                [prop, ATTRIBUTE_VALUE, l(value.value)],
              ],
            };
          }
          return {};
        },
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
          return {};
        },
      },
      //
      //
      // {
      //   name: "PropertyRangeRule",
      //   when: q("?property range ?type", "?any ?property ?value"),
      //   then: ({ value, type }) =>
      //     // Only object-valued terms should appear in subject position.
      //     // TODO: How would you say this in userland?
      //     is_node(value) ? { assert: [[value, ISA, type]] } : {},
      // },
    ],
  }),
};
