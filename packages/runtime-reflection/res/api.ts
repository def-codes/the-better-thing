// Vocabulary
export const ECMASCRIPT_RUNTIME_HOST_IRI =
  "http://def.codes/ECMAScript/RuntimeHost";

// A situated thing.  This is the instance that runs in the runtime itself.
// Clients would not normally access it directly, since such clients would
// themselves be in the runtime and should have access to more direct
// interfaces.
export interface ECMAScriptRuntimeHost {
  "@type": typeof ECMASCRIPT_RUNTIME_HOST_IRI;
  // Note that you can implement datafy for *this* thing.
  // Main question there being, would it include built-ins?

  // How do you get anything back?
  // What kind of subscribable can it provide (i.e. changes in namespace)
  // In general, that is the job of things.  And this is a thing.

  // Does this need to keep a connection to a globalThis?  at least internally?

  // Yes, eval can return a value.  But this is not meant as a synchronous
  // interface.  This is more about sinking code for side-effects.
  eval_sink(code: string): void;
}
