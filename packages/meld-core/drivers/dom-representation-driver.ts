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
const v = rdf.variable;
const l = rdf.literal;

const ISA = n("isa");
const MATCHES = n("def:matches");
const CONTAINS_TEXT = n("def:containsText");
const REPRESENTS = n("def:represents");
const SUBJECT = n("rdf:subject");
const PREDICATE = n("rdf:predicate");
const OBJECT = n("rdf:object");

export default {
  name: "domRepresentationDriver",
  init: ({ q, is_node }) => ({
    claims: q(
      // Maybe a bad term because it's “transitive” in an informal way
      "def:representsTransitive subpropertyOf def:represents",
      // Relate types with unicode symbols
      // These are hex strings...
      `Person def:symbolizedByCodePoint ${0x1f464}`,
      `Woman def:symbolizedByCodePoint ${0x2640}`,
      `Man def:symbolizedByCodePoint ${0x2642}`,
      `name subpropertyOf rdfs:label`
    ),
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
        comment: `A *transitive* representation of a resource contains a 
          representation of each of its property values`,
        when: q(
          "?s ?p ?o",
          "?rep def:representsTransitive ?s",
          "?rep isa def:DomElement"
        ),
        then: ({ rep, s, p, o }) => {
          // Odd, but vars in output get presence checking
          const prop = v("prop");
          const trip = v("trip");
          console.log(`prop rep rule`);
          return {
            assert: [
              [rep, n("def:contains"), prop],
              [prop, ISA, n("def:DomElement")],
              [prop, REPRESENTS, trip],
              [trip, SUBJECT, s],
              [trip, PREDICATE, p],
              [trip, OBJECT, o],
            ],
          };
        },
      },
      {
        name: "RDFaTypeRepresentationRule",
        when: q(
          "?thing isa ?type",
          "?rep isa def:DomElement",
          "?rep def:represents ?thing"
        ),
        then: ({ rep, type }) => ({
          assert: [[rep, MATCHES, l(`[typeof~="${type.value}"]`)]],
        }),
      },
      // {
      //   name: "LabelAtStartRule",
      //   when: q(
      //     "?statement rdf:predicate rdfs:label",
      //     "?rep isa def:DomElement",
      //     "?rep def:represents ?statement"
      //   ),
      //   // PROVISIONAL
      //   then: ({ rep }) => ({ assert: [[rep, MATCHES, l(`:first-child`)]] }),
      // },
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
        then: ({ rep, property, value }) => ({
          assert: [
            [rep, MATCHES, l(`[property="${property.value}"]`)],
            [rep, MATCHES, l(`[content="${value.value}"]`)],
            // Set both text and content attribute
            [rep, CONTAINS_TEXT, l(value.value)],
          ],
        }),
      },
      // Yes, you could do this more generally for text, but we want to talk
      // about Unicode explicitly at some point.
      {
        name: "PersonIcon",
        when: q(
          "?thing isa ?type",
          "?rep isa def:DomElement",
          "?rep def:represents ?thing",
          "?type def:symbolizedByCodePoint ?hex"
        ),
        then: ({ rep, hex }) => ({
          assert: [[rep, CONTAINS_TEXT, l(String.fromCodePoint(hex))]],
        }),
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
