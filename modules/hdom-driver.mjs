import { register_driver } from "./system.mjs";
import { render } from "./value-view.mjs";

// Hack for browser/node support
import * as rs1 from "../node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
import * as txhdom1 from "../node_modules/@thi.ng/transducers-hdom/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;
const txhdom = Object.keys(txhdom1).length ? txhdom1 : thi.ng.transducersHdom;

const { updateDOM } = txhdom;

register_driver("hdomDriver", ({ q }) => ({
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
          get: () => updateDOM({ root: find(element), ctx: { render } })
        }
      })
    }
  ]
}));
