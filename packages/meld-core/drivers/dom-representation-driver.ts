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
const b = rdf.blankNode;
const l = rdf.literal;

const ISA = n("isa");
const MATCHES = n("def:matches");
const REPRESENTS = n("def:represents");
const SUBJECT = n("rdf:subject");
const PREDICATE = n("rdf:predicate");
const OBJECT = n("rdf:object");

export default {
  name: "domRepresentationDriver",
  init: ({ q, is_node }) => ({
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
        name: "RDFaPropertyRepresentationRule",
        comment:
          "Each property value has a concrete representation (contained by its resource representation)",
        when: q(
          "?s ?p ?o",
          "?rep def:represents ?s",
          "?rep isa def:DomElement"
        ),
        then: ({ rep, s, p, o }) => {
          const prop = b();
          // const trip = b();
          return {
            assert: [
              [rep, n("def:contains"), prop],
              [prop, ISA, n("def:DomElement")],
              [rep, MATCHES, l(`[property="${p.value}"]`)],
              [rep, MATCHES, l(`[content="${o.value}"]`)],
              // This of course creates an infinite loop
              // [prop, REPRESENTS, trip],
              // [trip, SUBJECT, s],
              // [trip, PREDICATE, p],
              // [trip, OBJECT, o],
            ],
          };
        },
      },
      {
        name: "something with an element rule",
        when: q(
          "?subject ?property ?object",
          "?trip rdf:object ?object",
          "?rep def:represents ?trip",
          "?rep isa def:DomElement"
        ),
        then: ({ rep, object }) =>
          is_node(object)
            ? {
                assert: [
                  [rep, MATCHES, l(`a`)],
                  [rep, MATCHES, l(`[href="${object.value}"]`)],
                ],
              }
            : {},
      },

      // THIS rule is essentially moot.  It was working in conjunction with the
      // `RDFaPropertyRepresentationRule`.  That approach is more flexible but
      // causes infinite loop, as noted.  So the attributes are done there.
      {
        name: "RDFaPropertyAttributeRule",
        when: q(
          "?subject ?property ?value",
          "?trip rdf:subject ?subject",
          "?trip rdf:predicate ?property",
          "?trip rdf:object ?value",
          "?rep def:represents ?trip",
          "?rep isa def:DomElement"
        ),
        then: ({ rep, property, value }) =>
          // TODO: s/b in filter
          value.termType // === "Literal"
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
