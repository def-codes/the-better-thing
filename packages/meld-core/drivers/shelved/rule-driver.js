(function() {
  // this is just a special kind of traversal:
  // starting at the node identifying the expression
  // traverse into "hasClause"
  // and traverse from there into hasS, hasP, hasO
  // those terms have to be final, right?
  // how would you know that a term at that point weren't to be taken at face value?
  get_clauses_for = (store, expression) => {
    //store.triples
  };

  const RULE_DRIVER = {
    claims: [
      "Rule isa Class",
      "RulePredicate isa Class",
      "RuleConsequent isa Class",
      "RulePredicate subclassOf Query",
      //"RuleConsequent subclassOf Expression...?"
      // hasPredicate is already used by clause... I know.  Namespaces.
      "hasCondition isa Property", // hasPredicate
      "hasCondition domain Rule", // hasPredicate
      "hasCondition range RulePredicate", // hasPredicate
      "hasConsequent isa Property",
      "hasConsequent domain Rule",
      "hasConsequent range RuleConsequent"
    ],
    rules: [
      {
        // It should be possible to handle all rule arities here.
        when: q(
          "?rule hasCondition ?condition",
          "?rule hasConsequent ?consequent"
        ),
        then({ rule, condition, consequent }, system) {
          // now synchronously get all of the clauses
          get_clauses_for(store, condition);
          get_clauses_for(store, consequent);
        }
      },
      // 1-ary rule
      //
      // unfortunately we can't just treat each clause separately and sync them
      // since the variables can have different meanings in different clauses
      {
        when: q(
          "?rule hasCondition ?predicate",
          "?rule hasConsequent ?consequent",
          "?stream implements ?predicate",
          "?stream as Subscribable",
          "?consequent hasClause ?cc1",
          "?cc1 hasSubject ?cs1",
          "?cc1 hasPredicate ?cp1",
          "?cc1 hasObject ?co1"
        ),
        then: (
          { rule, predicate, consequent, stream, cs1, cp1, co1 },
          system
        ) => {
          const stream_instance = system.find(stream);
          console.log(`stream_instance`, stream_instance);
          stream_instance.subscribe(rs.trace("just... yeah"));
          // console.log(
          //   `rule, predicate, consequent, stream, cs1, cp1, co1`,
          //   rule,
          //   predicate,
          //   consequent,
          //   stream,
          //   cs1,
          //   cp1,
          //   co1
          // );
        }
      },
      // This rule isn't matching anyway, in test
      {
        when: q(
          "?rule hasPredicate ?predicate",
          "?rule hasConsequent ?consequent",
          "?predicate hasClause ?pc1",
          "?consequent hasClause ?cc1",
          "?pc1 hasSubject ?ps1",
          "?pc1 hasPredicate ?pp1",
          "?pc1 hasObject ?po1",
          "?cc1 hasSubject ?cs1",
          "?cc1 hasPredicate ?cp1",
          "?cc1 hasObject ?co1"
        ),
        then: (
          { rule, predicate, consequent, ps1, pp1, po1, cs1, cp1, co1 },
          system
        ) => {
          console.log(`pp1, po1, cs1, cp1, co1`, ps1, pp1, po1, cs1, cp1, co1);
        }
      }
    ]
  };

  if (meld) meld.register_driver(RULE_DRIVER);
  else console.warn("No meld system found!");
})();
