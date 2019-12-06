const { map_object } = require("@def.codes/helpers");

// a graph mapping that prepends the given string to each id in a graph stream.
// but you end up seeing this as the key.  rather want to see the label

const prefix_keys = prefix =>
  map_object((value, key) =>
    key === "subject" || key === "object" ? `${prefix}${value}` : value
  );
module.exports = { prefix_keys };
