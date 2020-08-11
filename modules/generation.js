/*
  See `generation.md`
  
  Entries are in the form:

  - GIVEN an RNG

  - WHEN you want a random value conforming to X

  - THEN this function will return such

  ASSUMES that RNG protocol includes `next` function that yields value between 0 and 1
 */
define([], () => {
  // Things I can imagine wanting
  const rough_examples = {
    null: {
      foo: () => null,
    },
    any: {
      // I mean theoretically the implication here is that you want to cover some range
      // I guess you could pick something from the known specs (that don't require params)
      foo: () => 0,
    },
    boolean: {
      foo: rng => rng.next() < 0.5,
    },
    "any number between zero and one": {
      foo: rng => rng.next(),
    },
    "any number": {
      // Hmm, what is the upper bound here (and elsewhere that range is not specified)...
      // I think the short answer is, if you don't know, you have to assume something
      // The knowledge that's not being represented here is not so much about the intent
      // as the result.... when we *don't* specify a distribution, these should yet be
      // (more or less) evenly distributed over some range.  But what is that range?
      // and where do you say it, if not in the spec?  or do you need an explicit rule that says
      // when a range is not specified, then this range will do (since you can't exceed it anyway)
      foo: rng => rng.next() * Number.MAX_SAFE_INTEGER,
    },
    "any integer": {
      foo: rng => rng.next(),
    },
    "any positive number": {
      foo: rng => rng.next(),
    },
    "any positive integer": {
      foo: rng => rng.next(),
    },
    "any number less than or equal to N": {
      foo: n => rng => rng.next() * n,
    },
    "any integer less than or equal to N": {
      // Hmm... do we need bindings for this?  i.e. X where X is a number and X lte N?
      // Else how do we write the partial predicates?
      pattern: { $and: [$.number, [math.lte, $.var.n]] },
      // rand can be 1 right?
      foo: n => rng => Math.floor(rng.next() * n),
    },
    "any string": {
      foo: rng => rng.next(),
    },
    "any character (string of length one)": {
      foo: rng => rng.next(),
    },
    "map with a name key": {
      foo: (rng, $keys) => {
        const ret = {};
        for (const key of $keys) {
          // Wait, we really don't care about the value?
          ret[key] = true;
        }
        return ret;
      },
    },
    // We don't currently have a syntactical way to talk about sets
    // Not that that means we can't do so
    // set: {
    //   foo: rng => new Set(),
    // },
    vector: {
      foo: rng => [],
    },
  };
  const foo = "bar";

  // Things I can imagine (but don't care about)
  // any square (you can get this by mapping)
  // any prime number (you can get this by mapping random int to prime index)
});
