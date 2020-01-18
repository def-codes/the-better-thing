const tx = require("@thi.ng/transducers");
const { map_object } = require("@def.codes/helpers");

// a graph mapping that prepends the given string to each id in a graph stream.
// but you end up seeing this as the key.  rather want to see the label

const prefix_keys = prefix =>
  map_object((value, key) =>
    key === "subject" || key === "object" ? `${prefix}${value}` : value
  );

// Add the given prefix to node id's and edge references, preserving node
// labels.  Can be used to merge multiple graphs into the same Dot program,
// assuming that the prefix will not cause collisions.
const prefix_statement_keys = prefix => statements =>
  tx.map(stmt => {
    if (stmt.type === "node") {
      const { id, attributes = {}, ...rest } = stmt;
      return {
        ...rest,
        id: `${prefix}${stmt.id}`,
        attributes: {
          ...attributes,
          label: attributes.label != null ? attributes.label : id,
        },
      };
    }

    if (stmt.type === "edge")
      return {
        ...stmt,
        from: `${prefix}${stmt.from}`,
        to: `${prefix}${stmt.to}`,
      };

    return stmt;
  }, statements);

const clusters_from = (dict, prefix) =>
  Object.entries(dict).map(([key, dot_statements]) => {
    const scope = `${prefix ? prefix + "/" : ""}${key}`;
    return {
      type: "subgraph",
      id: `cluster ${scope}`,
      attributes: { label: key },
      statements: [...prefix_statement_keys(scope + "/")(dot_statements)],
    };
  });

module.exports = { prefix_keys, prefix_statement_keys, clusters_from };
