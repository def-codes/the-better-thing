// The system wants to be seen.

const driver_registered = thi.ng.rstream.subscription();

var meld = {
  register_driver(driver) {
    driver_registered.next(driver);
  }
};

const make_model = () => {
  const store = new thi.ng.rstreamQuery.TripleStore();
  // should have a stream syng, and let subscriptions
  return {
    store,
    assert: fact => store.add(fact),
    set_all(facts) {
      for (const fact in facts) store.add(fact);
    }
  };
};

const make_driver = (spec, system_model) => {
  for (const rule of spec.rules)
    system_model.addQueryFromSpec({ q: [rule.match] }).subscribe({
      next(matches) {
        // so.... make ANOTHER query subscription now?
        for (const match of matches) {
          console.log(`match`, match);
          const selection = rule.select(match);

          system_model
            .addQueryFromSpec({ q: [rule.gather(selection)] })
            .subscribe({
              next(matches) {
                if (matches.size > 1)
                  console.warn("expected one match", matches);
                for (const match of matches) rule.format(match);
              }
            });
        }
      }
    });
};

const make_system = () => {
  const system_model = new thi.ng.rstreamQuery.TripleStore();

  function add_driver(driver) {
    make_driver(driver, system_model);
  }

  driver_registered.subscribe({ next: add_driver });

  return {
    assert(fact) {
      system_model.add(fact);
    }
  };
};

const sys = make_system();
sys.assert(["algebra", "a", "ex:VariableTimer"]);
sys.assert(["algebra", "ex:hasInterval", 1001]);
