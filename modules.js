const show = require("./lib/show");

// COPIED mostly from modules-subgraph

const longest_common_prefix = ([first, ...rest]) => {
  let i = 0;
  for (; i < first.length; i++) {
    const char = first[i];
    if (!rest.every(s => s[i] === char)) break;
  }
  return first.slice(0, i);
};

// convert back into (what was probably) the original module id
const normalize_with = prefix => s => {
  if (!s.startsWith(prefix)) throw `expected ${s} to start with ${prefix}`;
  s = s
    .slice(prefix.length)
    .replace(/\\/g, "/")
    .replace(/(^node_modules\/|(\/index)?\.js$)/g, "");
  // SPECIAL CASE
  if (s.startsWith("@thi.ng")) s = s.replace(/\/lib/, "");
  return s;
};

function* facts_from_require_cache(cache = require.cache) {
  const prefix = longest_common_prefix(Object.keys(cache));
  const normalize = normalize_with(prefix);

  for (const [name, mod] of Object.entries(cache)) {
    const subject = normalize(name);
    yield { subject, value: subject };
    for (const child of mod.children)
      yield { subject, object: normalize(child.filename) };
  }
}

exports.display = {
  dot_graph: {
    directed: true,
    statements: show.facts([...facts_from_require_cache()]),
  },
};
