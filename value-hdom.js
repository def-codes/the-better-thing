const { render_value } = (function() {
  const render_function = (_, fn) => ["code", fn.toString()];
  const render_null = _ => ["span", { "data-type": "null" }, "∅"];
  const render_undefined = _ => ["span", { "data-type": "undefined" }, "<>"];
  const render_primitive = (_, value) => [
    "span",
    { "data-type": typeof value },
    value.toString()
  ];

  const render_array = (_, array, path) => [
    "ul",
    { "data-type": "array" },
    Array.from(array, (value, index) => [
      "li",
      { "data-type": "array-item" },
      [render_value, value, [...path, index]]
    ])
  ];

  const render_object = (_, object, path) => [
    "div",
    { "data-type": "object" },
    Array.from(Object.entries(object), ([key, value]) => [
      "div",
      { "data-type": "object-property", "data-property": key },
      ["span", key],
      " ",
      ["div", [render_value, value, [...path, key]]]
    ])
  ];

  const render_value = (_, value, path = []) => {
    if (value === null) return [render_null];
    if (value === undefined) return [render_undefined];

    if (typeof value === "function") return [render_function, value];
    if (
      typeof value === "number" ||
      typeof value === "string" ||
      typeof value === "boolean"
    )
      return [render_primitive, value];
    if (Array.isArray(value)) return [render_array, value, path];

    return ["span", value ? JSON.stringify(value) : "(falsy)", " "];
  };

  return { render_value };
})();
console.log(`render_value`, render_value);
