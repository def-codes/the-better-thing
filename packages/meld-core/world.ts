// Utility for mocking iteration on a model using a monotonic implementation,
// which is not designed to deal with retractions.  So if you want to get the
// effect of arbitrary edits, you have to destroy the world and re-create it
// every time.  Options are same as monotonic_system, minus `store`.
import * as rs from "@thi.ng/rstream";
import * as tx from "@thi.ng/transducers";
import { TripleStore } from "@thi.ng/rstream-query";
import { read } from "@def.codes/expression-reader";
import { interpret } from "./interpreter";
import { monotonic_system } from "./system";

export const monotonic_world = opts => {
  let dispose_old_system;

  // Subscripton to all current facts, persisting over changing stores.
  //
  // A metaStream would make sense here, but using it in this way causes an
  // illegal state error whose cause was not obvious.  This approach works fine.
  const facts = rs.subscription();
  // const facts = rs.metaStream(store =>
  //   store
  //     .addQueryFromSpec({ q: [{ where: [["?s", "?p", "?o"]] }] })
  //     .transform(tx.map(() => store.triples))
  // );

  let fact_push;

  function _interpret(userland_code) {
    let statements;
    try {
      statements = read(userland_code);
    } catch (error) {
      return { error, when: "reading-code" };
    }

    let new_triples;
    try {
      new_triples = interpret(statements);
    } catch (error) {
      return { error, when: "interpreting-code" };
    }
    if (dispose_old_system) dispose_old_system();
    if (fact_push) fact_push.unsubscribe();
    opts.ports.cleanup();

    const store = new TripleStore();
    //facts.next(store);
    fact_push = store
      .addQueryFromSpec({ q: [{ where: [["?s", "?p", "?o"]] }] })
      .subscribe(tx.sideEffect(() => facts.next(store.triples)));

    store.into(new_triples);

    try {
      opts.dom_root.innerHTML = "";
      dispose_old_system = monotonic_system({ ...opts, source: store });
    } catch (error) {
      return { error, when: "creating-system" };
    }

    return true;
  }

  return { interpret: _interpret, facts };
};
