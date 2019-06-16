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
      /*
      {
        // `listener` is a term referring to the resource to become a subscription.
        // `subscribable` is a resource that we expect to refer to a stream
        // This rule will not fire until the source is implemented.
        when: q(
          "?listener listensTo ?source",
          "?subscribable implements ?source",
          "?subscribable as Subscribable"
          //"?target implements ?listener",
          //"?target as Subscribable"
        ),
        // we don't need the reference to source as such
        then({ listener, target, source, subscribable }, system) {
          const subscribable_instance = system.find(subscribable);
          const target_instance = system.find(target);
          console.log(`listener, target, source`, listener, target, source);

          // This kind of inconsistency could also be checked via above ontology
          if (typeof subscribable_instance.subscribe !== "function")
            return {
              warning: {
                message: "Expected ${subscribable.value} to be a subscribable",
                context: { subscribable, subscribable_instance }
              }
            };

          return {
            register: {
              subject: subscribable,
              as_type: "Subscribable",
              get: () =>
                subscribable_instance.subscribe({
                  next(value) {
                    // console.log(
                    //   `subscription fired praise God!!!`,
                    //   source,
                    //   value
                    // );
                  }
                })
            }
          };
        }
      },
*/
      {
        when: q("?timer hasInterval ?ms"),
        then: ({ timer, ms }) => ({
          register: {
            subject: timer,
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
            as_type: "Stream",
            get: () => rs.fromRAF()
          }
        })
      }
    ]
  }));
})();
