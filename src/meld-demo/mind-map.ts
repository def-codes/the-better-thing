export default {
  "@graph": [
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
      status: "IN-PROGRESS",
      partOf: "function-testing"
    },
    {
      id: "get-data-from-model",
      label: "support getting outside from model",
      status: "TODO",
      supports: "function-testing"
    },
    { id: "meld-mind-map", label: "mind map" },
    { id: "function-testing", label: "function testing" },
    { id: "create-meld-mind-map", label: "DONE create meld mind map" },
    { id: "https://www.w3.org/TR/json-ld/", label: "JSON-LD" }
  ]
};
