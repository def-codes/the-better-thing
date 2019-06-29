import { MELD_EXAMPLES } from "./meld-examples.js";

// Hack for browser/node support
import * as rs1 from "./node_modules/@thi.ng/rstream/lib/index.umd.js";
import * as tx1 from "./node_modules/@thi.ng/transducers/lib/index.umd.js";
import * as hdom1 from "./node_modules/@thi.ng/hdom/lib/index.umd.js";
const rs = Object.keys(rs1).length ? rs1 : thi.ng.rstream;
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;
const hdom = Object.keys(hdom1).length ? hdom1 : thi.ng.hdom;

//  const { MELD_EXAMPLES } = window;
console.log(`MELD_examples`, MELD_EXAMPLES);

const render_examples = (_, items) => [
  "ul",
  tx.map(
    item => ["li", ["a", { href: `/model.html?${item.name}` }, item.label]],
    items
  )
];
hdom.renderOnce(() => [render_examples, MELD_EXAMPLES], { root: "examples" });

// except I think this is not needed now
// HACK: work around unwanted scrolling of page when focusing textarea.
document.body.addEventListener(
  "focus",
  function(event) {
    event.preventDefault();
    if (event.target.classList.contains("userland-code-input")) {
      const ex = event.target.closest(".example");
      if (ex) {
        ex.scrollIntoView();
      }
    }
  },
  true
);
