import * as tx from "@thi.ng/transducers";
import * as rs from "@thi.ng/rstream";
import { datafy } from "@def.codes/datafy-nav";

export default {
  name: "navigationDriver",
  init: ({ q }) => ({
    claims: q("Navigable domain Context"),
    rules: [
      {
        when: q("?thing isa Navigable"),
        then: ({ subject }) => ({
          register: {
            subject,
            as_type: "Navigable",
            using: () =>
              // TODO: promote to userland.  need fromEvent support
              // interpret node as event target
              rs.fromEvent(window, "onhashchange").transform(tx.map(datafy)),
          },
        }),
      },
    ],
  }),
};
