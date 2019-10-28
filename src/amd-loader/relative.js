// UNUSED: functions based on AMD spec that I don't need

/*
http://wiki.commonjs.org/wiki/Modules/1.1.1#Module_Identifiers

1. A module identifier is a String of "terms" delimited by forward slashes.

2. A term must be a camelCase identifier, ".", or "..".

3. Module identifiers may not have file-name extensions like ".js".

4. Module identifiers may be "relative" or "top-level". A module identifier is
   "relative" if the first term is "." or "..".
*/
const IS_RELATIVE = /^[.][.]?\//;
const is_relative = id => IS_RELATIVE.test(id);

/*
5. Top-level identifiers are resolved off the conceptual module name space root.

6. Relative identifiers are resolved relative to the identifier of the module in
   which "require" is written and called.
*/
