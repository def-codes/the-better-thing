import { datafy_protocol, nav_protocol } from "../protocols";

export const extend_Object = {
  datafy() {
    // We have a number of options here, most of them not very good.  This object
    // may have non-data properties, and since we don't know anything about it, we
    // can't intelligently “sanitize” (i.e. datafy) it.  Instead, we return it
    // as-is (as Clojure does in the Object base case).  This merely prevents a
    // crash when datafying objects without a special implementation.
    datafy_protocol.extend(Object, obj => obj);
  },
  nav() {
    // Same as Clojure's default implementation for Object.
    // https://github.com/clojure/clojure/blob/b70db9639f9acddcabf7f760ea4bb050d6bfaa16/src/clj/clojure/core/protocols.clj
    nav_protocol.extend(Object, (obj, key, value) => value);
  }
};
