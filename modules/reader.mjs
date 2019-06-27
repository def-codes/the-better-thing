import { make_scanner, EXPR } from "./expression-scanner.mjs";

// General walker for plain JS objects.  Uses reverse path.
function* walk(x, path = []) {
  if (Array.isArray(x))
    for (let i = 0; i < x.length; i++) yield* walk(x[i], [i, ...path]);
  else if (x !== null && typeof x === "object") {
    for (const [k, v] of Object.entries(x)) yield* walk(v, [k, ...path]);
    for (const s of Object.getOwnPropertySymbols(x))
      yield* walk(x[s], [s, ...path]);
  } else yield [x, path];
}

/*
    The trick to collecting statements is that we can't tell in the proxy where
    we are relative to any other expression.  To solve this, we keep a unique ID
    on every expression and dump the accumulated context every time it changes.
    Basically a “statement” is an expression that isn't part of another
    expression.  So we return only the contexts containing at least one element
    not used in any other context.
   */

const scan = code => {
  const contexts = [];
  new Function("world", `with (world) { ${code} }`)(make_scanner(contexts));
  return contexts;
};

export const read = userland_code => {
  const collected = scan(userland_code);

  // Get all of the expression id's referenced for each context.
  const idx = new Map();
  for (const expr of collected)
    idx.set(
      expr,
      [...walk(expr)].filter(([v, [key]]) => key === EXPR).map(([v]) => v)
    );

  const statements = [];
  for (const expr of collected) {
    const unique = idx.get(expr).some(id => {
      for (const [key, value] of idx.entries())
        if (key !== expr && value.includes(id)) return false;
      return true;
    });

    if (unique) statements.push(expr);
  }

  return statements;
};
