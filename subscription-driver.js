(function() {
  if (!meld) throw "No meld system found!";

  meld.register_driver("subscriptionsDriver", ({ q }) => ({
    claims: [],
    rules: [
      {
        // Assumes only one thing can implement a resource as a subscribable.
        comment: `Subject subscribes to object once it is defined as subscribable`,
        when: q(
          "?a listensTo ?b",
          "?source implements ?b",
          "?source as Subscribable"
        ),
        then: () => {
          console.log(`line 17`);

          // return {
          //   summer: {}
          // };
        }
      }
    ]
  }));
})();
