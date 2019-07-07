import { datafy_protocol } from "../datafy-protocol";

export function datafy_Object() {
  // We have a number of options here, most of them not very good.  This object
  // may have non-data properties, and since we don't know anything about it, we
  // can't intelligently “sanitize” (i.e. datafy) it.  Instead, we return it
  // as-is (as Clojure does in the Object base case).  This merely prevents a
  // crash when datafying objects without a special implementation.
  datafy_protocol.extend(Object, obj => obj);
}
