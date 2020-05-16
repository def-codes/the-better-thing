// Forward-chaining rules implementing several RDFS(+) properties.
// “RDFS Plus” is a notion from Hendler
//
// So yeah these things comes from the OWL namespace, but it would be misleading
// to call this an OWL driver, since the parts proper to OWL require far more
// sophistication to implement.
//
// https://www.oreilly.com/library/view/semantic-web-for/9780123735560/OEBPS/10_chapter08.htm
// see also https://docs.cambridgesemantics.com/anzograph/userdoc/inferences.htm
// http://mlwiki.org/index.php/RDFS-Plus
import rdf from "@def.codes/rdf-data-model";

const n = rdf.namedNode;

const ISA = n("isa");

export default {
  name: "rdfsPlusDriver",
  init: ({ q, is_node }) => ({
    claims: q(
      // RDFS:
      "domain domain Property",
      "domain range Class", // right? or type?
      "range domain Property",
      "range range Class" // right? or type?
    ),
    // Is Class a Class?
    rules: [
      {
        name: "PropertyDomainRule",
        when: q("?property domain ?type", "?resource ?property ?any"),
        then: ({ resource, type }) => ({ assert: [[resource, ISA, type]] }),
      },
      {
        name: "PropertyRangeRule",
        when: q("?property range ?type", "?any ?property ?value"),
        then: ({ value, type }) =>
          // Only object-valued terms should appear in subject position.
          // TODO: How would you say this in userland?
          is_node(value) ? { assert: [[value, ISA, type]] } : {},
      },
      {
        name: "SubclassRule",
        when: q("?s subclassOf ?c", "?x isa ?s"),
        then: ({ x, c }) => ({ assert: [[x, ISA, c]] }),
      },
      {
        name: "SubpropertyRule",
        when: q("?sub subpropertyOf ?super", "?x ?sub ?y"),
        // `super` is a reserved word
        then: ({ x, super: S, y }) => ({ assert: [[x, S, y]] }),
      },
      {
        name: "SymmetricPropertyRule",
        when: q("?p isa SymmetricProperty", "?x ?p ?y"),
        then: ({ y, p, x }) => ({ assert: [[y, p, x]] }),
      },
      {
        name: "InversePropertyRule1",
        when: q("?forward inverseOf ?backward", "?x ?forward ?y"),
        then: ({ y, backward, x }) => ({
          assert: [[y, backward, x]],
        }),
      },
      {
        name: "InversePropertyRule2",
        when: q("?forward inverseOf ?backward", "?y ?backward ?x"),
        then: ({ x, forward, y }) => ({
          assert: [[x, forward, y]],
        }),
      },
      {
        name: "TransitivePropertyRule",
        when: q("?p isa TransitiveProperty", "?x ?p ?y", "?y ?p ?z"),
        then: ({ x, p, z }) => ({ assert: [[x, p, z]] }),
      },
    ],
  }),
};
