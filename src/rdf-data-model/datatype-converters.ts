// Problem with doing this in this library is that you really want it to be
// modeled through the MELD system

// You *could* have an open protocol for extension, but that would imply a
// registry at the module instance level.  This would mean that all consumers
// would have to share the lexical mappings defined by anyone else in the
// runtime environment.
//
// It would be just as feasible (and more idiomatic) to register the converters
// are resources.
//
// But:
//
// - wouldn't some converters need to be built-in for the system to work, anyway
//   (e.g. function, as noted below)?
//
// - wouldn't that mean that conversion may be asynchronous, since you'd have to
//   look up a converter through a query, and possibly remote?
//
// -
//
// That is, lexical mappings should be expressed as RDF resources.  The two are
// not mutually exclusive.  You can write them in a module and describe them
// with RDF.

// Map datatypes IRI's to functions for converting between string and runtime
// representations.  In general, these will belong in RDF.  However, you need at
// least a “function” converter to bootstrap that.

import * as RDF from "@def.codes/rdf-data-model";
import rdf from "@def.codes/rdf-data-model";
//import { xsd, meld } from "./prefixes";
import { isFunction, isNumber, isString } from "@thi.ng/checks";

const xsd = "xsd";
const meld = "meld";

type Serialize<T> = (t: T) => string;
type Deserialize<T> = (s: string) => T;
interface Converter<T> {
  datatype_iri: string;
  /** A predicate to tell whether this converter can serialize this runtime value. */
  can_serialize: (v: any) => boolean;
  serialize: Serialize<T>;
  deserialize: Deserialize<T>;
}

const sd = <T>(
  datatype_iri: string,
  can_serialize: (v: any) => boolean,
  deserialize: Deserialize<T>,
  serialize: Serialize<T> = x => x.toString()
): Converter<T> => ({ datatype_iri, can_serialize, serialize, deserialize });

export const CONVERTERS: Converter<any>[] = [
  sd(`${meld}javascriptFunction`, isFunction, expr => eval(expr)),
  sd(`${xsd}number`, isNumber, s => parseFloat(s)),
  sd(RDF.STRING_TYPE_IRI, isString, s => s),
];

const find_serializer = (value: any) =>
  CONVERTERS.find(it => it.can_serialize(value));

// yeah could use dict
const find_deserializer = (iri: string) =>
  CONVERTERS.find(it => it.datatype_iri === iri);

export const to_literal = (runtimeValue: any) => {
  const converter = find_serializer(runtimeValue);
  if (converter)
    return Object.assign(
      rdf.literal(
        converter.serialize(runtimeValue),
        rdf.namedNode(converter.datatype_iri) // yeah wasteful
      ),
      { runtimeValue } // PROVISIONAL
    );
};

export const from_literal = <T>(literal: RDF.Literal): T | undefined => {
  const converter = find_deserializer(literal.datatype.value);
  if (converter) return converter.deserialize(literal.value);
};
