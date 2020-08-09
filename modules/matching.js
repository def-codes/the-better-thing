/*
  Simple matching and predicate “compiler”.

  Subject-oriented predicates, where full pattern match / unify is overkill.

  Essentially for protocol matching / polymorphic dispatch

  Pattern can be compiled variously, e.g. to run synchronously (as here), or to
  run stepwise, support instrumentation, etc

  General goals:
  - base predicates are ~O(1)
    - complexity is ~|tree|

  Currently lacks:
  - binding (well, result of match is passed)
  - named spec reference (i.e. conform to this named spec at this point)
    - this would require more context to be passed through
  - prototype / instance matching
  - RDF interop (@type recognition)
  - isa / subtyping
  - any kind of inference

 */
define([], () => {
  const exists = x => x != null;
  const triple_equals = a => b => a === b;
  const typeof_equals = t => x => typeof x === t;
  const is_null = x => x === null;
  const is_undefined = x => x === undefined;

  // I don't think we need a proxy for this (yet), it's a bounded set
  const constructors = {
    and: (...$and) => ({ $and }),
    or: (...$or) => ({ $or }),

    // Primitive typeof tests
    ...Object.fromEntries(
      ["boolean", "number", "string", "symbol", "bigint"].map($typeof => [
        $typeof,
        { $typeof },
      ])
    ),
  };

  const compile_matcher = (pattern, context) => {
    // Constructor is a wildcard, it means no predicate.
    if (pattern === context?.wildcard) return undefined;

    if (pattern === null) return is_null;

    // Why?  If you already have null as a marker, why not ignore this?
    // Matching undefined makes no sense.  It's not a signal from the user (it can come from asking for nonexistent)
    // i.e. something you could destructure from nothing should not be able to constitute a pattern
    // if (pattern === undefined) return is_undefined;

    switch (typeof pattern) {
      case "string":
      case "boolean":
      case "number":
      case "symbol":
      case "bigint":
        return triple_equals(pattern);
      case "function":
        // We assume function is a predicate
        return pattern;
    }

    if (typeof pattern.$typeof === "string")
      return typeof_equals(pattern.$typeof);

    const compile_clauses = pats =>
      pats.map(x => compile_matcher(x, context)).filter(exists);

    // If it's an array match an array and all subpatterns
    if (Array.isArray(pattern)) {
      const subpatterns = compile_clauses(pattern);
      return x =>
        Array.isArray(x) && x.length === pattern.length && subpatterns.every(x);
    }

    // If it's a regex literal, interpret as a regex matcher
    if (pattern instanceof RegExp) return pattern.test.bind(pattern);

    // Intersection
    if (Array.isArray(pattern.$and)) {
      const clauses = compile_clauses(pattern.$and);
      return x => clauses.every(x);
    }

    // Union
    if (Array.isArray(pattern.$or)) {
      const clauses = compile_clauses(pattern.$or);
      return x => clauses.some(x);
    }

    console.warn(`Unrecognized matching pattern`, pattern);
    return;
  };

  return { compile_matcher, constructors };
});
