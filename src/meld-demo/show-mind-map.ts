import * as tx from "@thi.ng/transducers";
import * as hdom from "@thi.ng/hdom";
import { MIND_MAP } from "./mind-map";

interface MindMapNode {
  [key: string]: any;
}

const render_mind_map = (_, items: Iterable<MindMapNode>) => [
  "ul",
  tx.map(
    item => [
      "li",
      [
        "a",
        {
          id: item.id,
          href: item.userland_code ? `/model.html?${item.id}` : `#${item.id}`,
        },
        item.label,
      ],
      [
        "ul",
        tx.map(
          ([key, value]) =>
            ["label", "id"].includes(key)
              ? null
              : [
                  "li",
                  ["span", key],
                  " ",
                  [
                    "b",
                    Array.isArray(value)
                      ? ["ul", tx.map(v => ["li", v], value)]
                      : value,
                  ],
                ],
          Object.entries(item)
        ),
      ],
    ],
    items
  ),
];

export function show_mind_map() {
  hdom.renderOnce(() => [render_mind_map, MIND_MAP["@graph"]], {
    root: "mind-map",
  });
}
