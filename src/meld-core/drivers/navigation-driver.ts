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
              // No, actually, this should be done by host and sent in.
              rs.fromEvent(window, "onhashchange").transform(tx.map(datafy)),
            // This should be applied unconditionally, and not here.  To make
            // this work with multiple contexts, you need a way to identify the
            // the nearest broader context and navigate relative terms within
            // it.

            // TODO: promote to userland.  need fromEvent support and a way to
            // describe mappings between nodes and event targets.

            // want to trap Navigable, but it will plug into an already-existing
            // event stream (or one it lazily triggers by reference).

            // But right you have to make something (anything) a Navigable.  If
            // you were really taking thing's context into consideration, how
            // would that change things?  On local static pages you can't follow
            // out-of-domain links, but you *can* follow links to internal
            // things, and internal things can (and are kind of the only ones
            // who can) represent arbitrary external things.  So you can
            // "virtually visit" and virtually represent any namespace.  Even
            // within a single page.
            //
            // Now, when we're representing domains as such, how should we do
            // so?
          },
        }),
      },
    ],
  }),
};
