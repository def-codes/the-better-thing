// Driver for asserting representations of everything in a graph
import rdf from "@def.codes/rdf-data-model";

const n = rdf.namedNode;

const ISA = n("isa");
const DOM_ELEMENT = n("def:DomElement");
const REPRESENTS = n("def:represents");
const REPRESENTS_TRANSITIVE = n("def:representsTransitive");

export default {
  name: "domRepresentEverythingDriver",
  init: ({ q }) => ({
    claims: q(),
    rules: [
      {
        // PROVISIONAL
        name: "RepresentEverythingRule",
        when: q("?subject ?p ?o"),
        then: ({ subject }) => {
          // HACK. avoids blank nodes
          const rep = n(`representationOf${subject.value}`);
          return {
            assert: [
              [rep, ISA, DOM_ELEMENT],
              // TEMP: Avoiding REPRESENTS_TRANSITIVE because it's really slow rn
              [rep, REPRESENTS, subject],
            ],
          };
        },
      },
    ],
  }),
};
