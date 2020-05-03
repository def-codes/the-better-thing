// DOM updater implementation using HDOM
import { DomElementExpression } from "../dom-expression";
import { DomUpdateMechanism } from "../api";
import * as tx from "@thi.ng/transducers";
import { ILifecycle } from "@thi.ng/hdom";

const placeholder = (
  name: string,
  mounted: (name: string, element: Element) => void
): ILifecycle => ({
  init(element) {
    mounted(name, element);
  },
  render() {
    return ["div", { "data-placeholder": name, __skip: true }];
  },
});

const transform_expression = (
  mounted: (name: string, element: Element) => void,
  expression: DomElementExpression
) =>
  expression.element === "placeholder"
    ? placeholder(expression.attributes["name"], mounted)
    : [
        expression.element,
        expression.attributes,
        tx.map(
          expr =>
            typeof expr === "string" || typeof expr === "number"
              ? expr
              : transform_expression(mounted, expr),
          expression.children || []
        ),
      ];

export const implementation: DomUpdateMechanism = {
  process_node(mounted, container, expression) {
    console.log("HDOM PROCESS NODE:", container, expression);
  },
};
