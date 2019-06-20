// Temporary driver for selected OWL properties.
// Prefer to implement these as reified (userland) rules, but some pieces are
// still not in place.
(function() {
  const NAME = "owlBasicDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs } = thi.ng;
  const { rdf } = window;

  const n = rdf.namedNode;

  const ISA = n("isa");

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(),
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
        then: ({ value, type }) => ({ assert: [[value, ISA, type]] })
      },
      {
        name: "SubclassRule",
        when: q("?s subclassOf ?c", "?x isa ?c"),
        then: ({ x, c }) => ({ assert: [[x, ISA, c]] })
      },
      {
        name: "SubpropertyRule",
        when: q("?sub subpropertyOf ?super", "?x ?super ?y"),
        then: ({ x, sub, y }) => ({ assert: [[x, sub, y]] })
      },
      {
        name: "SymmetricalPropertyRule",
        when: q("?p isa SymmetricalProperty", "?x ?p? ?y"),
        then: ({ y, p, x }) => ({ assert: [[y, p, x]] })
      },
      {
        name: "TransitivePropertyRule",
        when: q("?p isa TransitiveProperty", "?x ?p ?y", "?y ?p ?z"),
        then: ({ x, p, z }) => ({ assert: [[x, p, z]] })
      },
      {
        name: "TransitivePropertyRule",
        when: q("?p isa TransitiveProperty", "?x ?p ?y", "?y ?p ?z"),
        then: ({ x, p, z }) => ({ assert: [[x, p, z]] })
      }
    ]
  }));
})();
