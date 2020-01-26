// for “debug” --- keeping out of main lib for clarity

// narrative description of the dictionary obtained from the queries
const describe_finding = ([label, map]) =>
  label +
  Array.from(
    map,
    ([candidate, condition_sets]) =>
      ` is ${candidate}\n` +
      condition_sets
        .map(conditions =>
          Object.entries(conditions).length
            ? `    if ` +
              Object.entries(conditions)
                .map(([l, n]) => `${l} is ${n}`)
                .join(" AND \n       ")
            : ""
        )
        .join("\n   OR \n")
  ).join("\n ");

const describe_findings = findings =>
  Object.entries(findings)
    .map(describe_finding)
    .join("\n");

module.exports = { describe_findings };
