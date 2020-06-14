// Driver for asserting representations of everything in a graph
export default {
  name: "domRepresentEverythingDriver",
  init: ({ q, is_node, rdf: { namedNode: n } }) => {
    const ISA = n("isa");
    const DOM_ELEMENT = n("def:DomElement");
    const REPRESENTS = n("def:represents");
    const REPRESENTS_TRANSITIVE = n("def:representsTransitive");

    return {
      claims: q(),
      rules: [
        {
          name: "RepresentAllSubjectsRule",
          when: q("?subject ?predicate ?object"),
          then: ({ subject }) => {
            const rep = n(`${subject.value}$representation`);
            return {
              assert: [
                [rep, ISA, DOM_ELEMENT],
                // TEMP: Avoiding REPRESENTS_TRANSITIVE because it's really slow rn
                [rep, REPRESENTS, subject],
              ],
            };
          },
        },
        {
          name: "RepresentObjectResourcesRule",
          when: q("?subject ?predicate ?object"),
          then: ({ object }) => {
            // Should this include blank nodes too?  Why wouldn't it?
            if (is_node(object)) {
              const rep = n(`${object.value}$representation`);
              return {
                assert: [
                  [rep, ISA, DOM_ELEMENT],
                  [rep, REPRESENTS, object],
                ],
              };
            }
            return {};
          },
        },
      ],
    };
  },
};
