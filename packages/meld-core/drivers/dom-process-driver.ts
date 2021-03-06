// Monotonic driver for dom process (aka hdom regions)
import * as rs from "@thi.ng/rstream";

export default {
  name: "domProcessDriver",
  init: ({ q, rdf: { namedNode: n } }) => ({
    claims: q("DomProcess isa Class"),
    rules: [
      {
        // Must have been a WIP
        disabled: true,
        when: q("?home as Container", "?domProcess as DomProcess"),
        then({ home, domProcess }, { find }) {
          console.log("DOM PROCESS DRIVER", find(home), find(domProcess));
          return {
            // register: {
            //   subject: stream,
            //   // Here and below this seems it should be stream, but system doesn't
            //   // traverse subclasses when doing these lookups.
            //   as_type: "Subscribable",
            //   using: () => rs.stream(source.valueOf()),
            //   // DEBUG: uncomment to log stream values
            //   // .subscribe(rs.trace("DEBUG stream"))
            // },
          };
        },
      },
      {
        // TODO: kill this after deciding on approach.  only used from one example
        disabled: true,
        when: q(
          "?x emits Templates",
          "?sub implements ?x",
          "?sub as Subscribable",
          "?rep def:represents ?x"
        ),
        then: ({ x, sub, rep }, { find, dom_process }) => ({
          register: {
            subject: n(`reps/${x}`),
            as_type: "Subscribable",
            // we can't say this more directly atm...
            using: () => find(sub).subscribe(dom_process.ports.get(sub.value)),
          },
          assert: [[rep, n("def:contains"), sub]],
        }),
      },
      {
        when: q(
          "?rep def:represents ?source",
          "?x emitsTemplatesFor ?source",
          "?sub implements ?x",
          "?sub as Subscribable"
        ),
        then: ({ source, sub, rep }, { find, dom_process }) => ({
          register: {
            subject: source,
            as_type: "DomProcessSink",
            using: () => find(sub).subscribe(dom_process.ports.get(sub.value)),
          },
          assert: [[rep, n("def:contains"), sub]],
        }),
      },
      {
        // TODO: as above.  also must have been an earlier attempt
        disabled: true,
        when: q(
          "?region isa DomRegion",
          "?region isa Subscribable",
          "?sub implements ?region",
          "?sub as Subscribable"
          // Hmm, this doesn't unify.  I mean yeah there's no overlap but...
          // "?dp implements domProcess",
          // "?dp as DomProcess"
        ),
        // So I put dom_process here to get around that
        then({ region, sub }, { dom_process }) {
          if (dom_process) {
            const name = `DomSinkFor${region.value}`;
            console.log("FEEEBAR", region, sub, dom_process);
            return {
              register: {
                subject: n(name),
                as_type: "Subscribable",
                using: () => {
                  const ret = dom_process.ports.get(region.value);
                  console.log("REGISTERRRRR", ret);
                  return ret;
                },
              },
              assert: [[n(name), n("listensTo"), sub]],
            };
          }
        },
      },
    ],
  }),
};
