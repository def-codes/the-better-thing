// Temporary driver for selected OWL properties.
// Prefer to implement these as reified (userland) rules, but some pieces are
// still not in place.
import { register_driver } from "./system";
import rdf from "./rdf";

const n = rdf.namedNode;

const ISA = n("isa");

register_driver("owlBasicDriver", ({ q, is_node }) => ({
  claims: q(
    // RDFS:
    "domain domain Property",
    "domain range Class", // right? or type?
    "range domain Property",
    "range range Class" // right? or type?
  ),
  // Is Class a Class?
  rules: [
    // Domain and range are really from RDFS
    {
      name: "PropertyDomainRule",
      when: q("?property domain ?type", "?resource ?property ?any"),
      then: ({ resource, type }) => ({ assert: [[resource, ISA, type]] })
    },
    {
      name: "PropertyRangeRule",
      when: q("?property range ?type", "?any ?property ?value"),
      then: ({ value, type }) =>
        // Only object-valued terms should appear in subject position.
        // TODO: How would you say this in userland?
        is_node(value) ? { assert: [[value, ISA, type]] } : {}
    },
    {
      name: "SubclassRule",
      when: q("?s subclassOf ?c", "?x isa ?s"),
      then: ({ x, c }) => ({ assert: [[x, ISA, c]] })
    },
    {
      name: "SubpropertyRule",
      when: q("?sub subpropertyOf ?super", "?x ?sub ?y"),
      // `super` is a reserved word
      then: ({ x, super: S, y }) => ({ assert: [[x, S, y]] })
    },
    {
      name: "SymmetricPropertyRule",
      when: q("?p isa SymmetricProperty", "?x ?p ?y"),
      then: ({ y, p, x }) => ({ assert: [[y, p, x]] })
    },
    {
      name: "InversePropertyRule1",
      when: q("?forward inverseOf ?backward", "?x ?forward ?y"),
      then: ({ y, backward, x }) => ({
        assert: [[y, backward, x]]
      })
    },
    {
      name: "InversePropertyRule2",
      when: q("?forward inverseOf ?backward", "?y ?backward ?x"),
      then: ({ x, forward, y }) => ({
        assert: [[x, forward, y]]
      })
    },
    {
      name: "TransitivePropertyRule",
      when: q("?p isa TransitiveProperty", "?x ?p ?y", "?y ?p ?z"),
      then: ({ x, p, z }) => ({ assert: [[x, p, z]] })
    }
  ]
}));
