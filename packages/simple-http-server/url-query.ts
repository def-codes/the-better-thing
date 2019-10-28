import { dictionary_from } from "@def.codes/helpers";

/** Return a plain javascript object representing a given URL query string. */
export const deserialize_query = (query: string) =>
  dictionary_from(
    query.split("&").map(_ => _.split("=")),
    ([key]) => decodeURIComponent(key),
    ([_, value]) => decodeURIComponent(value)
  );

/** Format a plain javascript object as a URL query (not including leading
 * question mark). */
export const serialize_query = (query: object) =>
  Object.keys(query)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(query[key]))
    .join("&");
