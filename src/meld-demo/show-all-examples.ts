import * as tx from "@thi.ng/transducers";
import * as hdom from "@thi.ng/hdom";
import { MELD_EXAMPLES } from "./meld-examples";
import { MeldExample } from "./types";

const render_examples = (_, items: Iterable<MeldExample>) => [
  "ul",
  tx.map(
    item => ["li", ["a", { href: `/model.html?${item.name}` }, item.label]],
    items
  )
];

export function show_all_examples() {
  hdom.renderOnce(() => [render_examples, MELD_EXAMPLES], { root: "examples" });
}
