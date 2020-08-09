/*
  Not exactly a Linda tuple space but similar in spirit.

  QUESTION: What is the protocol for the `then` function?
  - assert?
  - possibilities

  QUESTION: If there are multiple match (`when`) types (spec | SPARQL), do all
  consequents (`then`) assume the same signature / binding result?

  - spec is subject-oriented match
    - result is a conformance (or not)
    - not all nodes are tagged
      - they are in Clojure, this is supposedly important
  - SPARQL is ‘at-large’ match
    - result is a binding
    - no specific subject

    For subject-oriented matches, spec-type

    ALSO: If the "tuple" is supposed to be removed from the value space

  QUESTION: if `given` some context, would this need to know about it?

  QUESTION: does it make sense to do this synchronously?  i.e. shouldn't it be
  possible to implement blocking writes?  And aren't you throwing away the
  usefulness of the thing if you can't?  This is necessarily bound to the
  question of the `then` function's semantics/protocol.

  A handler is a matching rule.  There are various kinds of matching.

  I keep using the word “rule”, but these would not really be good for
  invariants... I don't think they compose deterministically.

  The space should be observable.  What happens?
  - values are put
  - values are matched
  - values fail to match
  - values are stored
  - matchers are registered
  - matchers are removed
  - a newly-added matcher matched something

  Supports arbitrary runtime values (using `EquivSet`).

  It is event-baed.

  It can be seen as a collection of rules.

  It interprets incoming values against the space.

  It applies the match for each rule against the space.

  The application of the match may be delegated (?)

  It disposes of unhandled values according to their disposition.

  If a value does not indicate its disposition,

  JSON-LD and possibly some in-house protocols are recognized as representing
  linked data.

  Variants:
  - not short-circuiting: all handlers apply.  slowest, eschews conflict resolution
  - short-circuiting and ranked by complexity: fastest, simplest (most general) rules have precedence
  - short-circuiting and ranked by reverse complexity: more specific rules have precedence

 */
define(["@thi.ng/associative", "./matching"], (assoc, matching) => {
  const { compile_matcher } = matching;
  const { ArraySet } = assoc;

  const make_value_space = () => {
    const ports = {};
    const state = { values: new ArraySet(), rules: new Map() };

    function* match_value(value) {
      for (const rule of state.rules.values()) {
        const match = rule.compiled_when(value);
        if (match) yield { rule, match, value };
      }
    }

    function* match_rule(rule) {
      for (const value of state.values) {
        const match = rule.compiled_when(value);
        if (match) yield { rule, match, value };
      }
    }

    const handle_or_save = ({ rule, match, value }) => {
      const result = rule.then(match, value);

      // The message was NOT handled: put the value in the store
      if (result === undefined) state.values.add(value);
      // The message was handled.  Delete in case it was there from earlier.
      else state.values.delete(value);

      // What do we do with result?
    };

    return {
      /** Add a value to the space */
      put(value) {
        for (const { rule, match } of match_value(value)) {
          handle_or_save({ rule, match, value });
          // break in here to short-circuit
        }
      },

      /** Add a rule to the space */
      // Who assigns id?
      register(id, rule_spec) {
        const compiled_when = compile_matcher(rule_spec.when);
        console.log("compiled when", compiled_when, rule_spec);
        const rule = { ...rule_spec, compiled_when };
        state.rules.set(id, rule);

        // Now check against existing values
        for (const bundle of match_rule(rule)) {
          handle_or_save(bundle);
          // break in here to short-circuit
        }
      },
      // if you must have non-monotonic:
      unregister(id) {
        state.rules.delete(id);
      },
    };
  };

  return { make_value_space };
});
