// Monotonic driver for (rstream) Stream and Subscription.
(function() {
  const STREAM_DRIVER = {
    claims: q(
      "Function isa Class",
      "Subscribable isa Class",
      "Stream isa Class",
      "Stream subclassOf Subscribable",
      "StreamSource isa Class",
      "StreamSource subclassOf Subscribable",
      "StreamSource subclassOf Function",
      "Listener isa Class",
      "hasSource isa Property",
      "hasSource domain Stream",
      "hasSource range StreamSource",
      "listensTo isa Property",
      "listensTo domain Subscribable",
      "listensTo range Listener",
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
          const source_function = source.value;

          // TODO: userland error reporting
          // This kind of inconsistency could also be checked via above ontology
          if (typeof source_function !== "function") {
            console.warn(`Unexpected stream source`, source);
            return;
          }

          system.register(stream, "Stream", () => rs.stream(source_function));
        }
      },
      {
        // `listener` is a term referring to the resource to become a subscription.
        // `subscribable` is a resource that we expect to refer to a stream
        // This rule will not fire until the source is implemented.
        when: q(
          "?listener listensTo ?source",
          "?subscribable implements ?source",
          "?subscribable as Subscribable"
        ),
        // we don't need the reference to source as such
        then({ listener, source, subscribable }, system) {
          const subscribable_instance = system.find(subscribable);

          // TODO: userland error reporting
          // This kind of inconsistency could also be checked via above ontology
          if (typeof subscribable_instance.subscribe !== "function") {
            console.warn(
              `Unexpected subscribable`,
              subscribable,
              subscribable_instance
            );
            return;
          }

          // Hmmm..... the rule doesn't talk about a subscription, but that's
          // what we're making here.
          const subscription = mint_blank();
          system.register(subscription, "Subscribable", () =>
            subscribable_instance.subscribe({
              next(value) {
                console.log(`subscription fired praise God!!!`, source, value);
              }
            })
          );
        }
      },
      {
        when: q("?timer hasInterval ?ms"),
        then({ timer, ms }, system) {
          system.register(timer, "Stream", () => rs.fromInterval(ms.value));
        }
      },
      {
        when: q("?timer isa RAF"),
        then({ timer, ms }, system) {
          system.register(timer, "Stream", () => rs.fromRAF());
        }
      }
    ]
  };

  if (meld) meld.register_driver(STREAM_DRIVER);
  else console.warn("No meld system found!");
})();
