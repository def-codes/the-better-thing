// clearinghouse for rules under development
import rdf from "./rdf.mjs";
import { register_driver } from "./system.mjs";

import { render, render_value } from "./value-view.mjs";

const n = rdf.namedNode;
const v = rdf.variable;
const { literal } = rdf;

// Hack for browser/node support
import * as rs1 from "../node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

register_driver("testDriver", ({ q }) => ({
  claims: q(),
  rules: [
    {
      comment: "Automatically create host output for all dataflow nodes.",
      when: q("?subject isa Subscribable"),
      then: ({ subject }) => ({
        assert: [[subject, n("hostOutput"), literal(subject.value)]]
      })
    },
    {
      comment: "Create a view in the main container for all dataflow nodes.",
      when: q("?subject isa Subscribable"),
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
