import type { DomElementExpression } from "@def.codes/hdom-regions";

export type DomAssertion =
  | { readonly type: "unknown"; selector: string }
  | { readonly type: "is"; expr: DomElementExpression }
  | { readonly type: "text-is"; text: string }
  | { readonly type: "uses-element"; name: string }
  | { readonly type: "contains"; id: string }
  | { readonly type: "contains-text"; text: string }
  | { readonly type: "attribute-equals"; name: string; value: string }
  | { readonly type: "attribute-contains-word"; name: string; value: string }
  // Special case for style because hiccup expects an object, not a string
  | { readonly type: "has-style"; property: string; value: string };

// provisional.  CSS rules are essentially assertions
export type CssAssertion = {
  selector: string;
  properties: {
    [property: string]: string | number;
  };
};
