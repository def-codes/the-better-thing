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
const CONTAINS = n("def:contains");
const CONTAINS_TEXT = n("def:containsText");
const REPRESENTS = n("def:represents");
const SUBJECT = n("rdf:subject");
const PREDICATE = n("rdf:predicate");
const OBJECT = n("rdf:object");
const DOM_ELEMENT = n("def:DomElement");

const GENERAL_VALUE_MAPPER = n("GeneralValueMapper");

// @ts-ignore
const general_value_to_template = l(value => ({
  element: "output",
  children: [
    value === undefined ? "⊥" : value === null ? "∅" : value.toString(),
  ],
}));

export default {
  name: "domRepresentationDriver",
  init: ({ q, is_node }) => ({
    claims: [
      ...q(
        // Maybe a bad term because it's “transitive” in an informal way
        "def:representsTransitive subpropertyOf def:represents",
        // Relate types with unicode symbols
        // These are hex strings...
        `Person def:symbolizedByCodePoint ${0x1f464}`,
        `Woman def:symbolizedByCodePoint ${0x2640}`,
        `Man def:symbolizedByCodePoint ${0x2642}`,
        `name subpropertyOf rdfs:label`
      ),
      [GENERAL_VALUE_MAPPER, n("mapsWith"), general_value_to_template],
    ],
    rules: [
      {
        name: "RDFaResourceRule",
        when: q("?rep isa def:DomElement", "?rep def:represents ?thing"),
        // TODO: conditions s/b in filter
        then: ({ rep, thing }) =>
          thing.termType === "NamedNode"
            ? { assert: [[rep, MATCHES, l(`[resource="${thing.value}"]`)]] }
            : thing.termType === "BlankNode"
            ? { assert: [[rep, MATCHES, l(`[resource="_:${thing.value}"]`)]] }
            : {},
      },
      {
        disabled: true,
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
              [rep, CONTAINS, prop],
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
      {
        disabled: true,
        name: "LabelAtStartRule",
        when: q(
          "?statement rdf:predicate rdfs:label",
          "?rep isa def:DomElement",
          "?rep def:represents ?statement"
        ),
        // PROVISIONAL
        then: ({ rep }) => ({ assert: [[rep, MATCHES, l(`:first-child`)]] }),
      },
      {
        disabled: true,
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
        disabled: true,
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
        name: "ThingRepContainsImplRep",
        when: q(
          "?impl implements ?thing",
          "?impl_rep def:represents ?impl",
          "?thing_rep def:represents ?thing"
        ),
        then: _ => ({ assert: [[_.thing_rep, CONTAINS, _.impl_rep]] }),
      },
      {
        name: "WholeRepContainsPartRep",
        when: q(
          "?whole hasPart ?part",
          "?whole_rep def:represents ?whole",
          "?part_rep def:represents ?part"
        ),
        then: _ => ({ assert: [[_.whole_rep, CONTAINS, _.part_rep]] }),
      },
      {
        // This isn't even really specific to representation
        comment: "A transducer is part of the node that uses it.",
        when: q("?node transformsWith ?transformer"),
        then: _ => ({ assert: [[_.node, n("hasPart"), _.transformer]] }),
      },
      {
        // Wait why is this disabled?
        // enabling it, you can see (at least some of) the node content (in dataflow space)
        // disabled: true,
        comment: `If something has a representation and an implementation, then its implementation also has a representation`,
        when: q("?rep def:represents ?thing", "?impl implements ?thing"),
        then: _ => {
          const it = n(`${_.impl.value}$representation`);
          return {
            assert: [
              [it, ISA, DOM_ELEMENT],
              [it, REPRESENTS, _.impl],
            ],
          };
        },
      },
      // This works in conjunction with a rule in dom-process driver
      {
        // assert a subscriber that, when implemented,
        // listens to the thing to be observed
        // and sets content for the associated representation
        name: "SubscribableRepresentationRule",
        when: q(
          "?thing isa Subscribable",
          "?source implements ?thing",
          "?rep def:represents ?thing",
          "?rep isa def:DomElement"
        ),
        then: ({ thing, rep, source }) => {
          const sub = n(`ProcessWatching/${thing.value}`);
          return {
            assert: [
              // Note that we must “listen to” the original thing, but we “emit
              // templates for” the implementation.
              [sub, n("listensTo"), thing],
              [sub, n("transformsWith"), GENERAL_VALUE_MAPPER],
              [sub, n("emitsTemplatesFor"), source],
            ],
          };
        },
      },
      // Space rules.  not about forcefields per se
      {
        comment: "A space with a representation has a forcefield",
        when: q("?space isa Space", "?something def:represents ?space"),
        then: ({ space }) => ({
          assert: [[n(`${space.value}$forcefield`), n("forcefieldFor"), space]],
        }),
      },
      // Using forcefields to represent dataflow
      {
        comment: `If there are any live dataflow nodes, assert a well-known space for representing them in graph form`,
        when: q("?sub isa Subscribable", "?something implements ?sub"),
        then: ({ sub }) => ({
          assert: [
            ...q(
              "DataflowSpace isa Space",
              "DataflowSpace$forcefield hasTicks DataflowSpace$ticker",
              "DataflowSpace$ticker hasInterval 500",
              "DataflowSpace$forcefield hasForce DataflowSpace$charge",
              "DataflowSpace$charge isa forceManyBody",
              "DataflowSpace$charge strength -50",
              "DataflowSpace$forcefield hasForce DataflowSpace$center",
              "DataflowSpace$center isa forceCenter",
              // Need to assert a representation because this wasn't in original
              // model.
              "DataflowSpaceEle def:represents DataflowSpace",
              "DataflowSpaceEle isa def:DomElement"
            ),
            [n("DataflowSpace"), n("hasPart"), sub],
          ],
        }),
      },
      {
        // Yes, repeats above predicate.  Could be done in a single rule
        // BUT: added assertion to above and disabled
        disabled: true,
        comment: `define every live dataflow node as part of a (well-known) dataflow space`,
        when: q("?sub isa Subscribable", "?something implements ?sub"),
        then: ({ sub }) => ({
          assert: [[n("DataflowSpace"), n("hasPart"), sub]],
        }),
      },
      {
        comment: `Assert a representation of (live) subscription relationships`,
        when: q("?x listensTo ?y", "?something implements ?x"),
        // Need a special rule for this because we don't generally assert
        // representations of all properties as such.
        then: ({ x, y }) => {
          const relation = n(`${x.value}/listensTo/${y.value}`);
          // technically this should represent the statement
          return {
            assert: [
              [relation, n("isa"), n("Relation")],
              [relation, n("def:represents"), relation],
              [relation, n("isa"), n("def:DomElement")],
              // These relations are in the space but are not *bodies* in the
              // forcefield.
              //
              // [n("DataflowSpace"), n("hasPart"), relation],
              [n("DataflowSpace"), CONTAINS, relation],
              [relation, CONTAINS_TEXT, l("halioaspdoi")],
            ],
          };
        },
      },
    ],
  }),
};
