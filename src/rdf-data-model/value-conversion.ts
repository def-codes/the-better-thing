//// first sketch
import { Literal } from "./api";
import rdf from "./index";

// or identify_datatype
// this arises when we have a runtime value that we don't know anything about
// THIS SHOULD NOT HAPPEN OFTEN!!!
// the return value is an IRI, though I suppose you could return a named node
// in terms of Clojure protocols/multimethods, this IRI is the dispatching value
export function synchronously_determine_datatype(
  value: any
): string | { error: string } {
  // These error codes should be named nodes / codes
  if (value === undefined) return { error: "Value is undefined" };

  /// from https://www.w3.org/TR/rdf-interfaces/#literals
  if (typeof value === "string") return "xsd:string";
  if (typeof value === "boolean") return "xsd:boolean";
  if (typeof value === "number") return "xsd:double";
  if (typeof value === "bigint") return "xsd:int";
  // The rest are all inexpressible in JS
  //    xsd:float
  //    xsd:decimal
  //    xsd:positiveInteger
  //    xsd:integer
  //    xsd:nonPositiveInteger
  //    xsd:negativeInteger
  //    xsd:long
  //    xsd:int
  //    xsd:short
  //    xsd:byte
  //    xsd:nonNegativeInteger
  //    xsd:unsignedLong
  //    xsd:unsignedInt
  //    xsd:unsignedShort
  //    xsd:unsignedByte

  if (value instanceof Date) return "xsd:dateTime";
  // xsd:date
  // xsd:time

  // We can try, but can't know if this closes over things...
  // also do we need to know whether it's an async function?
  if (typeof value === "function") return "wut:function";

  // shouldn't be messing with symbols
  // symbol.for can be reconstituted, but why?
  if (typeof value === "symbol") return "wut:symbol";

  if (value instanceof RegExp) return "wut:regularexpression";

  if (Array.isArray(value)) {
    // now what
  }
  const blah = typeof value;
  if (typeof value === "object") {
    // ? but this is a node, not a datatype, right?
    // also, could check earlier
    // and also could just consider invalid
    if (value === null) return "rdf:nil";

    // deeply check for
    // JSON-able objects

    // JSON-LD-able objects
    // look for an explicit `@type` or `@context`
    // Collection types...
    // Array / List
    // Set
    // Map?
  }
  // unknown
}

function synchronously_find_converter_for(datatype_iri: string) {
  return (_value: any) => "lexical rep";
}

export function to_literal(value: any): Literal | { error } {
  const datatype_iri = synchronously_determine_datatype(value);
  if (typeof datatype_iri !== "string")
    return { error: "Could not determine datatype" };

  // Here you need access to a registry
  const convert = synchronously_find_converter_for(datatype_iri);
  if (convert) {
    try {
      const lexical = convert(value);
      return Object.assign(rdf.literal(lexical, rdf.namedNode(datatype_iri)), {
        runtimeValue: value,
      });
    } catch (error) {
      return { error };
    }
  } else return { error: "No converter found" };
}
