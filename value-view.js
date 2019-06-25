// it appears that using `const` here would cause the script to be interpreted
// as a module and hence not put this in scope.  for standalone page, checkout
// inline modules https://v8.dev/features/modules
var value_view = (function() {
  // Circular dependency...
  //const { rdf_hdom } = window;
  //const { render_triples } = rdf_hdom;

  const render_function = (_, { value: fn }) => ["code", fn.toString()];
  const render_null = _ => ["span", { "data-type": "null" }, "∅"];
  const render_undefined = _ => ["span", { "data-type": "undefined" }, "⊥"];
  const render_primitive = (_, { value }) => [
    "span",
    { "data-type": typeof value },
    value.toString()
  ];

  const render_array = ({ render }, { value: array, path }) => [
    "ol",
    { "data-type": "array" },
    Array.from(array, (value, index) => [
      "li",
      { "data-type": "array-item" },
      [render, { value, path: [...path, index] }]
    ])
  ];

  const render_iterable = ({ render }, { type, value: iterable, path }) => [
    "ul",
    { "data-type": `${type} iterable` },
    // Use number in path, but the iterable may not be indexable as such.
    Array.from(iterable, (value, number) => [
      "li",
      { "data-type": "iterable-item" },
      [render, { value, path: [...path, number] }]
    ])
  ];

  const render_object = ({ render }, { value: object, path }) => [
    "div",
    { "data-type": "object-properties" },
    Array.from(Object.entries(object), ([key, value]) => [
      "div",
      { "data-type": "key-value", "data-property": key },
      ["span", { "data-type": "object-key" }, key],
      " ",
      [
        "div",
        { "data-type": "object-value" },
        [render, { value, path: [...path, key] }]
      ]
    ])
  ];

  // SPECIAL CASE, I just need to see these props, and object view doesn't show
  // props from prototype.
  const render_error = (_, { value, path }) => [
    render_object,
    {
      value: {
        ...value,
        message: value.message,
        fileName: value.fileName,
        lineNumber: value.lineNumber,
        stack: value.stack
      },
      path
    }
  ];

  // Dispatcher
  const render = (_, { value, path = [] }) => {
    if (value === null) return [render_null];
    if (value === undefined) return [render_undefined];

    // Limit depth to avoid crash from cycles.
    if (path.length > 7) return null;

    if (typeof value === "function") return [render_function, { value }];
    if (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean"
    )
      return [render_primitive, { value }];
    // SPECIAL CASE: testing
    if (Array.isArray(value.layers))
      return [
        "div.layers",
        tx.map(layer => ["div.layer", [render, { value: layer }]], value.layers)
      ];

    if (value["@type"] === "triples")
      return [rdf_hdom.render_triples, { value }];

    if (value instanceof Error) return [render_error, { value, path }];
    if (value instanceof Set)
      return [render_iterable, { type: "set", value, path }];

    if (Array.isArray(value)) return [render_array, { value, path }];
    if (typeof value === "object") return [render_object, { value, path }];

    return ["span", value ? JSON.stringify(value) : "(falsy)", " "];
  };

  // Wraps value in format needed for `render`, and wrap result in class needed
  // for stylesheets.  Referencing `render` directly rather than from context
  // because this may be called before hdom... wait.
  const render_value = value => ["div.value-view", [render, { value }]];

  return { render_value, render };
})();
