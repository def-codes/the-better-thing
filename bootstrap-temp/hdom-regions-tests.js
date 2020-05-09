define(["./hdom-regions-test-runner.js", "./hdom-regions-test-cases.js"], (
  { run_test_case },
  cases
) => {
  let i = 0;
  const root = document.querySelector("#hdom-regions-tests");
  for (const [name, test_case] of Object.entries(cases)) {
    if (name !== "removing") continue;
    console.log(`Running test`, name);
    run_test_case(test_case, root);
    if (i++ > 2) break;
  }
});
