const render_trie_node = (_, { value: [token, t] }) => [
  "span.trie-node",
  {
    "data-count": t ? t.count : 0,
    "data-is-match": t ? "yes" : "no",
    "data-is-terminal": t && t.count > 0 ? "yes" : "no"
  },
  ["span.token", token],
  " ",
  ["span.count", t ? t.count : ""]
];

const dom_svg_space = (_, { id }) => [
  "div.space",
  { id },
  ["div.html"],
  // is preserveAspectRatio needed?
  //
  // you can use "everything" to apply transforms that wouldn't work (the same
  // way) on svg element itself.  But see .css file.
  ["svg", { preserveAspectRatio: "none" }, ["g.everything"]]
];
