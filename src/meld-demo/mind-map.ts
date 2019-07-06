export default {
  "@graph": [
    {
      id: "view-refinement",
      label:
        "You can describe aspects of the appearance of particular types of things.",
      status: "TODO"
    },
    {
      id: "view-refinement-examples",
      label:
        "Make examples illustrating the essentials of refining appearance by type.",
      status: "IN-PROGRESS"
    },
    {
      id: "implement-view-refinement",
      label: "Make the view refinement examples work.",
      status: "NEXT"
    },
    {
      id: "stream-metamerge-bug",
      label:
        "Fix a bug where metamerge is getting created on streams.  Apparently a no-op for intervals (because of ordering), so it's gone unnoticed",
      status: "DONE"
    },
    {
      id: "trace-rule-firing",
      label:
        "The system could trace which rules fired and with what.  #deathtoconsolelog",
      status: "TODO"
    },
    {
      id: "things-to-datafy",
      label: "A list of things in JavaScript hosts that invite datafication",
      value: ["Error", "Response", "Node"]
    },
    {
      id: "merge-examples-and-mind-map",
      status: "TODO",
      label: "Convert mind map to JSON and merge with MELD examples."
    },
    {
      id: "convert-examples-to-json",
      status: "NOT-TODO",
      comment: `But JSON doesn't allow line breaks in strings.  So there's no way I'm editing that manually.`,
      label: "Convert MELD examples to JSON."
    },
    {
      id: "http-dereference-driver",
      status: "DONE",
      label:
        "A driver for providing the content of resources with HTTP/HTTPS IRI's."
    },
    {
      id: "create-http-dereference-vocabulary",
      status: "DONE",
      label:
        "create vocabulary for representing HTTP resources as stream sources.",
      partOf: "http-dereference-driver"
    },
    {
      id: "create-http-dereference-driver",
      status: "",
      label: "create driver for implementing HTTP vocabulary as stream source.",
      partOf: "http-dereference-driver"
    },
    {
      id: "javascript-modules",
      comment: `This is just for local development, currently not intended for userland`,
      label: "A vocabulary for talking about JavaScript modules."
    },
    {
      id: "create-javascript-modules-vocabulary",
      label: "A vocabulary for talking about JavaScript modules.",
      comment: `Basically punting.  Assuming needed semantics will arise.`,
      status: "DONE",
      partOf: "javascript-modules"
    },
    {
      id: "implement-javascript-module-import-driver",
      label: "Create a driver for importing JavaScript modules.",
      status: "DONE",
      partOf: "javascript-modules"
    },
    {
      id: "create-test-case-vocabulary",
      status: "DONE",
      label: "create a simple vocabulary for describing functional test cases",
      partOf: "function-testing"
    },
    {
      id: "create-test-case-format",
      label:
        "create test case format compatible with TypeScript and vocabulary",
      status: "DONE",
      partOf: "function-testing"
    },
    {
      id: "convert-existing-tests",
      label: "convert existing tests to function test case format",
      status: "DONE",
      partOf: "function-testing"
    },
    {
      id: "create-function-test-runner",
      label: "create runner for test case format",
      status: "DONE",
      partOf: "function-testing"
    },
    {
      id: "create-function-testing-cli",
      label: "create function testing CLI",
      status: "DONE",
      partOf: "function-testing"
    },
    {
      id: "create-function-testing-driver",
      label: "create function testing driver",
      status: "TODO",
      partOf: "function-testing"
    },
    {
      id: "support-indirect-function-reference-in-map",
      label:
        "Allow mapping function to be specified as a term whose value is a function, rather than a literal",
      comment: `I just created a special xform for my immediate purpose.  No polymorphism for now.`,
      status: "DONE"
    },
    {
      id: "load-existing-tests",
      label: "load and run existing tests via drivers",
      status: "DONE",
      partOf: "function-testing"
    },
    {
      id: "describe-test-result-representation",
      label: "Describe test result representation",
      status: "BLOCKED",
      blockedBy: "view-refinement",
      supports: "function-testing"
    },
    {
      id: "get-data-from-model",
      label: "support getting outside from model",
      status: "TODO",
      supports: "function-testing"
    },
    {
      id: "add-pluck-transducer",
      label: "Add pluck transducer",
      status: "DONE"
    },
    {
      id: "pluck-as-action-and-description",
      label: "Pluck as action and description",
      comment:
        "Picking out part of a represented value should capture the description of a pluck operation, which can be reified and turned into a transducer.",
      status: "IDEA"
    },
    { id: "meld-mind-map", label: "mind map" },
    { id: "function-testing", label: "function testing" },
    { id: "create-meld-mind-map", label: "DONE create meld mind map" },
    { id: "https://www.w3.org/TR/json-ld/", label: "JSON-LD" }
  ]
};
