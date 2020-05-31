// minimal pseudo-query support
import { metaStream } from "@thi.ng/rstream";
import { equiv } from "@thi.ng/equiv";

export default {
  name: "queryDriver",
  init: ({ q }) => {
    const make_dynamic_query = live_query => {
      const meta = metaStream(live_query);
      let last_pattern = undefined;
      return Object.assign(meta, {
        set_query(pattern) {
          // Avoid pointless changes... also avoids an upstream bug
          if (!equiv(pattern, last_pattern)) {
            last_pattern = pattern;
            meta.next(pattern);
          }
        },
      });
    };

    const parse_pseudoquery = (text: string) => q(...text.split(/[,\n]/g));

    return {
      claims: q(
        "queryText domain PseudoQuery",
        "PseudoQuery subclassOf Stream"
      ),
      rules: [
        {
          when: q("?subject isa PseudoQuery"),
          then: ({ subject }, { unstable_live_query }) => ({
            register: {
              subject,
              as_type: "Subscribable",
              using: () => make_dynamic_query(unstable_live_query),
            },
          }),
        },
        {
          when: q(
            "?subject isa PseudoQuery",
            "?query implements ?subject",
            "?query as Subscribable", // perhaps not necessary or ideal
            "?subject queryText ?text"
          ),
          then: ({ query, text }, { find }) => {
            find(query).set_query(parse_pseudoquery(text.value));
            return {}; // TODO: side-effect!
          },
        },
      ],
    };
  },
};
