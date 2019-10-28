// This is an extremely paranoid version of what's considered “special”.
const REGEXP_SPECIAL = /[^A-Za-z0-9_]/g;

/** Escape special regex characters in a given string. */
export const escape_regexp = s => s.replace(REGEXP_SPECIAL, "\\$&");

/** Return a pattern string that matches any of the given patterns. */
export const alternatives = patterns =>
  `(${patterns.map(escape_regexp).join("|")})`;
