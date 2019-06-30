import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import * as hdom from "@thi.ng/hdom";

import { MELD_EXAMPLES } from "./meld-examples";

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
    if (
      event.target instanceof HTMLElement &&
      event.target.classList.contains("userland-code-input")
    ) {
      const ex = event.target.closest(".example");
      if (ex) {
        ex.scrollIntoView();
      }
    }
  },
  true
);
