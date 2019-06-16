// Monotonic driver for (rstream) Stream and Subscription.
// Not sure if subscription and stream can be separated as such.
(function() {
  const NAME = "streamDriver";
  if (!meld) throw `${NAME}: No meld system found!`;

  const { rstream: rs } = thi.ng;

  meld.register_driver(NAME, ({ q }) => ({
    claims: q(
      "Function isa Class", // provisional. this would belong somewhere else
      "Stream isa Class",
      "Stream subclassOf Subscribable",
      "StreamSource isa Class",
      "StreamSource subclassOf Function",
      "Listener isa Class",
      "hasSource isa Property",
      "hasSource domain Stream",
      "hasSource range StreamSource",
      // not a general stream thing as such
      "Ticker subclassOf Stream",
      "hasInterval domain Ticker",
      "hasInterval range number"
    ),
    rules: [
      {
        // `stream` is a term referring to the resource to be implemented.
        // `source` is a (literal) term whose value is the source function.
        when: q("?stream hasSource ?source"),
        then({ stream, source }, system) {
          // This kind of inconsistency could also be checked via above ontology
          if (typeof source.value !== "function")
            return {
              warning: {
                message: "Expected stream `source` to be a function",
                context: { source }
              }
            };

          return {
            register: {
              subject: stream,
              as_type: "Stream",
              get: () => rs.stream(source.value)
              // DEBUG: uncomment to log stream values
              // .subscribe(rs.trace("DEBUG stream"))
            }
          };
        }
      },
      {
        when: q("?timer hasInterval ?ms"),
        then: ({ timer, ms }) => ({
          register: {
            subject: timer,
            // Here and below this seems it should be stream, but system doesn't
            // traverse subclasses when doing these lookups.
            as_type: "Subscribable",
            get: () => rs.fromInterval(ms.value)
          }
        })
      },
      {
        when: q("?timer isa RAF"),
        then: ({ timer }) => ({
          register: {
            subject: timer,
            as_type: "Subscribable",
            get: () => rs.fromRAF()
          }
        })
      }
    ]
  }));
})();
