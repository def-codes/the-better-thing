import { updateDOM } from "@thi.ng/transducers-hdom";
import { render } from "../value-view";
import rdf from "@def.codes/rdf-data-model";

export default {
  name: "hdomDriver",
  init: ({ q }) => ({
    claims: q(
      "DomContainer isa Class",
      "HdomTransducer subclassOf Transducer",
      "hasRoot domain HdomTransducer",
      "hasRoot range DomElement"
    ),
    rules: [
      {
        when: q(
          "?subject hasRoot ?container",
          "?element implements ?container",
          "?element as Container"
        ),
        // Reify the hdom transducer
        then: ({ subject, element }, { find }) => ({
          register: {
            subject,
            // See notes elsewhere
            // as_type: "HdomTransducer",
            as_type: "Transducer",
            // HACK: on what basis is this the context??
            get: () => updateDOM({ root: find(element), ctx: { render } }),
          },
        }),
      },
    ],
  }),
};
