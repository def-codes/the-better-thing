const RULE_DRIVER = {
  claims: [],
  rules: [
    {
      when: q(
        "?rule hasPredicate ?predicate",
        "?rule hasConsequent ?consequent"
      ),
      then: ({ rule, predicate, consequent }, system) => {
        // you would now need to get all of the clauses of this rule?
        // or what if you just get and create one clause at a time
        // and sync them
        // isn't that what rstream query does anyway, essentially?
        //
        // erm... not exactly, because you need to unify the variables across
        // the clauses.  so getting the whole thing at once is kind of critical.

        // create a subscription / metastream?

        if (typeof d3[type] === "function")
          system.register(x, () => d3[type]());
        else console.warn(`No such d3 force ${type}`);
      }
    }
  ]
};
