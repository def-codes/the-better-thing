import { run_test } from "@def.codes/function-testing";
import rdf from "@def.codes/rdf-data-model";

export default {
  name: "functionTestDriver",
  init: ({ q }) => ({
    claims: [
      ...q(
        "test$arguments domain test$FunctionTestCase",
        // Not sure what any of these range values should be.
        "test$arguments range Literal", // a vector
        "test$function domain test$FunctionTestCase",
        "test$function range Function",
        "test$output domain test$FunctionTestCase",
        "test$output range Literal"
      ),
      // @ts-ignore I KNOW, I know
      [rdf.namedNode("RunTest"), rdf.namedNode("value"), rdf.literal(run_test)],
    ],
    rules: [],
  }),
};
