const tx = require("@thi.ng/transducers");
const { map_object } = require("@def.codes/helpers");

// a graph mapping that prepends the given string to each id in a graph stream.
// but you end up seeing this as the key.  rather want to see the label

const prefix_keys = prefix =>
  map_object((value, key) =>
    key === "subject" || key === "object" ? `${prefix}${value}` : value
  );

const prefix_statement_keys = prefix => statements =>
  tx.map(
    map_object((value, key, obj) =>
      (obj.type === "node" && key === "id") ||
      (obj.type === "edge" && (key === "from" || key === "to"))
        ? `${prefix}${value}`
        : value
    ),
    statements
  );

module.exports = { prefix_keys, prefix_statement_keys };
