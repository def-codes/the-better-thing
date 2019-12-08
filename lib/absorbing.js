/*

Goal: “absorb” one object into another if:
- it is a pure data record
- exactly one other thing in the graph points to it

Pure data record means all values are primitives (or pure data records).

Absorb means simply, take it (and related edges) out of the graph.

The value will still be present in the containing record's value.

We might also say that in some conditions an object might be treated as a pure
data record even if it has some non-plain property values, provided that you can
make its record-style display point to the value's representation.

*/
