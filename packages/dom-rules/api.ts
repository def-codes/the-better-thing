export type DomAssertion =
  | { readonly type: "unknown"; selector: string }
  | { readonly type: "uses-element"; name: string }
  | { readonly type: "contains"; id: string }
  | { readonly type: "contains-text"; text: string }
  | { readonly type: "attribute-equals"; name: string; value: string }
  | { readonly type: "attribute-contains-word"; name: string; value: string }
  // Special case for style because hiccup expects an object, not a string
  | { readonly type: "has-style"; property: string; value: string };
