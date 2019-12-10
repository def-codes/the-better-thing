/*

Everything comes from functions, ultimately.  Certainly at the lowest level
(static, synchronous, deterministic), we can't get anywhere without calling
functions.  (At higher levels we might, e.g. make rules, which are not direct
invocations.)

There are two things to consider with respect to notating functions:
- functions themselves
- invocations/applications

A function *itself* may be a black box.  We may have varying degrees of
information about it.  At most, we might know its complete composition and
provenance, along with other semantics.  Still, a function by itself is inert.

A function *application* involves a function in conjunction with input and
output.

Deterministic functions (which will be our primary interest) we may consider as
independent from time.  For all possible inputs, the result of a given
deterministic function is “already” known, in a sense.  A function is a map, and
a map is a function.  In Clojure, maps are functions which take keywords as
arguments; likewise keywords are functions which take maps as arguments (IIRC).

We have many kinds of notation
- black box (a fallback for all others)
- logic gates for boolean combinators
- mathematical/arithmetical notations
- set notations
- plots (for real/continuous)
- mapping (arrow) notation
- “data flow” notation

Posit: if all object graphs can be lifted into a description (i.e. freed from pointers)
then all functions can be seen as graph transformations,
since they take (at most) object graphs as input and output

*/
