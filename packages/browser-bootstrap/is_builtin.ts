export const is_capitalized = s => "A" <= s && s <= "Z";

const PRIMITIVES = new Set([
  "Boolean",
  "Function",
  "Number",
  "Object",
  "String",
  "Symbol",
]);

/**
 *  It can be useful for reflection purposes to tell whether an object is
 *  user-defined or provided by the user agent.  The most decisive way to do
 *  this is to reference test the object's constructor against all of the
 *  constructors defined on a [clean “browsing
 *  context”](https://html.spec.whatwg.org/#creating-a-new-browsing-context)
 *  (that is, before authors start polluting the global namespace).
 *
 *  This function obtains a clean browsing context by adding an `iframe` to the
 *  document (which has an implicit location of `about:blank`).  The keys of the
 *  `iframe`'s window object are tested against this window for values that
 *  reference functions.  Only capitalized keys are included, since constructor
 *  names are always capitalized by convention.  **NOTE**: constructors of
 *  primitives are also excluded.
 *
 *  In my testing, the default iframe loads synchronously, but [not everyone
 *  thinks that's
 *  correct](https://lists.w3.org/Archives/Public/public-whatwg-archive/2013Oct/0345.html).
 *  See the WhatWG tickets [Unclear "iframe load event steps" for initial load
 *  of about:blank in an iframe](https://github.com/whatwg/html/issues/490) and
 *  [Semantics of initial "about:blank" elision are unclear; every browser
 *  disagrees](https://github.com/whatwg/html/issues/546).  At any rate, this
 *  implementation counts on the `iframe` loading synchronously.
 *
 * This all is perhaps a bit excessive if (as would be intended) this script is
 * loaded before anything else.  i.e. you could just use the existing context.
 *
 */
declare var window;

// It is indeed excessive and not portable.
function use_clean_context(cb) {
  cb(window || global);
  /*
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  const win = iframe.contentWindow;
  cb(win);
  document.body.removeChild(iframe);
  */
}

function get_builtin_constructors() {
  const builtins = new Set();

  use_clean_context(context => {
    for (let key of Object.getOwnPropertyNames(context))
      if (is_capitalized(key) && !PRIMITIVES.has(key)) {
        const value = context[key];
        if (typeof value === "function") builtins.add(value);
      }
  });

  return builtins;
}

const is_builtin_constructor = (() => {
  let builtins;
  return ctor =>
    (builtins || (builtins = get_builtin_constructors())).has(ctor);
})();

/**
 *  Tell whether a prototype is defined by the user-agent (as opposed to
 *  user-defined).
 *
 *  A prototype is deemed to be “native” the name of its constructor exists as a
 *  key in a clean global scope.
 */
export function is_instance_of_builtin(object) {
  const prototype = Object.getPrototypeOf(object);
  return (
    prototype &&
    prototype.constructor &&
    is_builtin_constructor(prototype.constructor)
  );
}
