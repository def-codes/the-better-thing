// clearinghouse for rules under development
import * as tx from "@thi.ng/transducers";
import rdf from "@def.codes/rdf-data-model";
import { register_driver } from "../system";

const n = rdf.namedNode;
const v = rdf.variable;
const { literal } = rdf;

register_driver("testDriver", ({ q }) => ({
  claims: q(),
  rules: [
    {
      comment: "Automatically create host output for all dataflow nodes.",
      // DISABLE: this creates too much output & blocks fact list
      when: q("?subject isa XSubscribable"),
      then: ({ subject }) => ({
        assert: [[subject, n("hostOutput"), literal(subject.value)]]
      })
    },
    {
      comment: "Create a view in the main container for all dataflow nodes.",
      // DISABLE: this creates too much output & blocks fact list
      when: q("?subject isa XSubscribable"),
      then: ({ subject }) => ({
        assert: [
          [n("home"), n("contains"), v("container")],
          [v("view"), n("viewOf"), subject],
          [v("view"), n("viewIn"), v("container")]
        ]
      })
    },

    // Hack to support multiple containers.  I think this would even support
    // nested containers, though I have no designs on that for this temporary
    // approach.
    {
      when: q(
        // in practice, parent is going to be host
        "?parent contains ?child",
        "?container implements ?parent",
        "?container as Container"
      ),
      then: ({ parent, child, container }, { find }) => ({
        register: {
          subject: child,
          as_type: "Container",
          get: () => find(container).appendChild(document.createElement("div"))
        }
      })
    },
    {
      when: q("?subject isa AllFacts"),
      then: ({ subject }, { unstable_live_query: query }) => ({
        register: {
          subject,
          as_type: "Subscribable",
          get: () =>
            query(q("?subject ?predicate ?object")).transform(
              tx.map(results =>
                // MUTATING!
                // Also, these are not rdf.js triples.
                // HACK: @type is just a signal to value view
                Object.assign(results, { "@type": "triples" })
              )
            )
        }
      })
    }
  ]
}));
