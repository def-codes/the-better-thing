// Serialize expressions from reader.  Currently only used by tests.

const serialize_literal = val =>
  Array.isArray(val)
    ? `[${val.map(serialize).join(", ")}]`
    : val !== null && typeof val === "object"
    ? `{${Object.entries(val)
        .map(([key, value]) => `${key}: ${serialize(value)}`)
        .join(", ")}}`
    : typeof val === "string"
    ? JSON.stringify(val)
    : val.toString();

export const serialize = expr =>
  Array.isArray(expr)
    ? expr.reduce(
        (acc, val) =>
          val.assign
            ? `${val.assign.term} = ${serialize(val.assign.value)}`
            : val.args
            ? acc + `(${val.args.map(serialize).join(", ")})`
            : val.term
            ? acc + (acc ? "." : "") + val.term
            : "unk",
        ""
      )
    : expr.literal
    ? serialize_literal(expr.literal)
    : "unk";
