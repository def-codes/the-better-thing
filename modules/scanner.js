/*
  Lazy, recursive mapping from literal object to assertions

  What macroexpand would be if it weren't macroexpand.

  Scanner is to be used early in the pipeline:

  human -> code read as JS -> evaled -> received by reader -> P -> downstream

  Okay, so it looks like a lot up front, but all of the serious stuff really
  happens downstream.

  Technically, we could get any JS object.  But the expectation is that this is
  obtained at something like “real time” from a human author, using available
  encoding tools.

  Default is to yield a simple grouping relationship, without changing level.
  (not changing path/name?)  assumption is key name will not conflict with

  But what changes default?  The presence of a thing that is a container.  But
  how can you know that at read time?

  It must be possible to define processes, inline.  You can do processes in various ways.
 */
define([], () => {
  const tuple_pattern_predicate = when => {
    const [key, value] = when;
    const preds = [];

    if (key === undefined) {
      /*no-op: don't care about key*/
    } else if (typeof key === "string") preds.push(([k]) => k === key);

    if (value === undefined) {
      /*no-op: don't care about value*/
    } else if (typeof value === "string") preds.push(([, v]) => v === value);

    return kv => preds.every(pred => pred(kv));
  };

  // ASSUMES no cycles in spec
  // Uses tuple as cons list to build paths
  function* scan_with_rules(spec, rules, path = []) {
    if (spec == null || typeof spec !== "object") {
      // console.warn(`spec of type ${typeof spec} is not supported! ${spec}`);
      return;
    }

    // Recur into arrays
    if (Array.isArray(spec)) {
      let i = 0;
      for (const item of spec) yield* scan_with_rules(item, rules, [i++, path]);
      return;
    }

    for (const kv of Object.entries(spec)) {
      const [key, value] = kv;

      // Apply all matching rules
      for (const rule of rules) {
        try {
          if (rule.test(kv)) {
            for (const result of rule.then(spec)) {
              yield ["apply-rule", { path, result }];
            }
          }
        } catch (error) {
          yield [
            "warn",
            {
              message: "scanner couldn't apply rule",
              context: { spec, rule, rules, path, error },
            },
          ];
          continue;
        }
      }

      yield* scan_with_rules(value, rules, [key, path]);
    }
  }

  const scan_with = (spec, rule_specs) =>
    scan_with_rules(
      spec,
      rule_specs.map(rule => ({
        ...rule,
        test: tuple_pattern_predicate(rule.when),
      }))
    );

  return { scan_with };
});
