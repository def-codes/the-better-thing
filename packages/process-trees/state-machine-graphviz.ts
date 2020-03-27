import * as Dot from "@def.codes/graphviz-format";
import { StateMachineSpec } from "./adapters/state-machines";

// Should be subgraph (or something) so it's composable
// but need to specify that this is directed, which you can't do for subgraph
export const state_machine_spec_to_dot = (
  spec: StateMachineSpec
): Dot.Graph => {
  return Dot.graph({
    directed: true,
    node_attributes: { shape: "circle" },
    statements: [
      ...Object.entries(spec.states).map(
        ([id, state]) =>
          ({
            id,
            type: "node",
            attributes: {
              label: (state.label ?? id) || "",
              shape: state.terminal && "doublecircle",
            },
          } as const)
      ),
      ...spec.transitions.map(
        ([from, trans, to, desc]) =>
          ({
            type: "edge",
            from,
            to,
            attributes: {
              label:
                (desc?.label ?? trans) +
                (desc?.postcondition ? `, ${desc.postcondition}` : ""),
            },
          } as const)
      ),
    ],
  });
};
