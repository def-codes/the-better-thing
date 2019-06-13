(function() {
  const RULE_DRIVER = {
    claims: [
      "Rule isa Class",
      "RulePredicate isa Class",
      "RuleConsequent isa Class",
      "RulePredicate subclassOf Query",
      // no... thing with multiple clauses.  anyway we're not really using the ontology
      //"RuleConsequent subclassOf Clause"
      // hasPredicate is already used by clause... I know.  Namespaces.
      "hasCondition isa Property", // hasPredicate
      "hasCondition domain Rule", // hasPredicate
      "hasCondition range RulePredicate", // hasPredicate
      "hasConsequent isa Property",
      "hasConsequent domain Rule",
      "hasConsequent range RuleConsequent"
    ],
    rules: [
      // 1-ary rule
      //
      // unfortunately we can't just treat each clause separately and sync them
      // since the variables can have different meanings in different clauses
      {
        when: q(
          "?rule hasCondition ?predicate",
          "?rule hasConsequent ?consequent",
          "?stream meld:implements ?predicate",
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
