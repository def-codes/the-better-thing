import rdf from "@def.codes/rdf-data-model";
import {
  Term,
  STRING_TYPE_IRI,
  LANGUAGE_STRING_TYPE_IRI
} from "@def.codes/rdf-data-model";

type PseudoTriple = [Term, Term, Term];

// Should be `rdf:type`.  Using this for now.
const RDF$TYPE = rdf.namedNode("isa");

const xsd = "http://www.w3.org/2001/XMLSchema#";
const XSD$STRING = rdf.namedNode(STRING_TYPE_IRI);
const XSD$INTEGER = rdf.namedNode(`${xsd}integer`);
const XSD$DOUBLE = rdf.namedNode(`${xsd}double`);
const XSD$BOOLEAN = rdf.namedNode(`${xsd}boolean`);
const LANGUAGE_TAGGED_STRING = rdf.namedNode(LANGUAGE_STRING_TYPE_IRI);

/* Implementation of [“§10.5 RDF to Object
 * Conversion”](https://www.w3.org/TR/2014/REC-json-ld-api-20140116/#rdf-to-object-conversion)
 * Remaining comments are taken from that specification.
 *
 * This algorithm transforms an RDF literal to a JSON-LD value object and a RDF
 * blank node or IRI to an JSON-LD node object.
 */
export const term_to_object = (value: Term, use_native_types: boolean) => {
  /** 1) If *value* is an IRI or a blank node identifier, return a new JSON
   * object consisting of a single member `@id` whose value is set to
   * *value*. */
  if (value.termType === "NamedNode") return { "@id": value.value };
  if (value.termType === "BlankNode") return { "@id": `_:${value.value}` };

  // RDF/JS includes these additional term types not applicable in the context
  // of this algorithm.
  if (value.termType === "DefaultGraph" || value.termType === "Variable")
    throw `${value.termType} not supported in triple-to-object conversion.`;

  /** 2) Otherwise value is an RDF literal: */

  /** 2.1) Initialize a new empty JSON object result. */
  const result = {};

  /** 2.2) Initialize *converted value* to *value*. */
  const lexical_value = value.value;
  let converted_value: boolean | string | number = lexical_value;

  /** 2.3) Initialize *type* to null */
  let type = null;

  /** 2.4) If *use native types* is true */
  if (use_native_types) {
    /** 2.4.1) If the datatype IRI of *value* equals `xsd:string`, set
     * *converted value* to the lexical form of *value*. */
    // prettier-ignore
    if (value.datatype === XSD$STRING) {
      // NO-OP: Value already contains the lexical form.
      // converted_value = value.value;
    }
    
    /** 2.4.2) Otherwise, if the datatype IRI of *value* equals `xsd:boolean`,
     * set *converted value* to true if the lexical form of *value* matches
     * `true`, or false if it matches `false`. If it matches neither, set
     * *type* to `xsd:boolean`. */
    // prettier-ignore
    else if (value.datatype === XSD$BOOLEAN) {
      if (lexical_value === "true") converted_value = true;
      else if (lexical_value === "false") converted_value = false;
      else type = XSD$BOOLEAN;
    }

    /** 2.4.3) Otherwise, if the datatype IRI of *value* equals `xsd:integer` or
     * `xsd:double` and its lexical form is a valid `xsd:integer` or
     * `xsd:double` according [XMLSCHEMA11-2], set *converted value* to the
     * result of converting the lexical form to a JSON number. */
    // prettier-ignore
    else if (value.datatype === XSD$INTEGER || value.datatype === XSD$DOUBLE) {
      const parsed = Number.parseFloat(lexical_value);
      if (!isNaN(parsed)) converted_value = parsed;
    }
  }
  // The remaining cases will never happen in the current implementation, which
  // is only used for object conversion and always passes flag as true.

  /** 2.5) Otherwise, if *value* is a language-tagged string add a member
   * `@language` to result and set its value to the language tag of *value*. */
  else if (value.datatype === LANGUAGE_TAGGED_STRING)
    result["@language"] = value.language;
  
  /** 2.6) Otherwise, set *type* to the datatype IRI of *value*, unless it
   * equals `xsd:string` which is ignored. */
  // prettier-ignore
  else if (value.datatype !== XSD$STRING)
    type = value.datatype.value;

  /** 2.7) Add a member `@value` to *result* whose value is set to *converted
   * value*. */
  result["@value"] = converted_value;

  /** 2.8) If *type* is not null, add a member `@type` to *result* whose value
   * is set to *type*. */
  if (type !== null) result["@type"] = type;

  /** Return result. */
  return result;
};

/**
   Implementation of section “§10.4 Serialize RDF as JSON-LD Algorithm” in the
   document “JSON-LD 1.0 Processing Algorithms and API”, item 3.5.
   https://www.w3.org/TR/2014/REC-json-ld-api-20140116/#serialize-rdf-as-json-ld-algorithm

   This is being done in the context of a single graph.  In the spec, “node map”
   refers to the graph's node map; here, we are only dealing with a single node,
   and so disregard instructions concerned with other parts of the node map.
 */
export const triples_to_object = (subject_facts: PseudoTriple[]): object => {
  /** 3.5.2) Reference the value of the *subject* member in *node map* using the
   * variable *node*. */
  let node: object;

  /** 3.5) For each RDF triple in graph consisting of *subject*, *predicate*,
   * and *object* */
  for (const [subject, predicate, object] of subject_facts) {
    /** 3.5.1) If *node map* does not have a *subject* member, create one and
     * initialize its value to a new JSON object consisting of a single member
     * `@id` whose value is set to *subject*. */
    // Should this be subject.value?  Subject is a term.
    if (node === undefined) node = { "@id": subject };

    /** 3.5.3) If *object* is an IRI or blank node identifier, and *node map*
     * does not have an *object* member, create one and initialize its value to
     * a new JSON object consisting of a single member `@id` whose value is set
     * to *object*. */

    // Skipping, see above.

    /** 3.5.4) If *predicate* equals `rdf:type`, the *use `rdf:type`* flag is
     * not true, and *object* is an IRI or blank node identifier, append
     * *object* to the value of the `@type` member of *node*; unless such an
     * item already exists. If no such member exists, create one and initialize
     * it to an array whose only item is *object*. Finally, continue to the next
     * RDF triple. */
    if (predicate === RDF$TYPE) {
      if (node["@type"]) node["@type"].push(object.value);
      else node["@type"] = [object.value];
    }

    /** 3.5.5) Set *value* to the result of using the RDF to Object Conversion
     * algorithm, passing *object* and *use native types*. */
    const value = term_to_object(object, true);

    /** 3.5.6) If *node* does not have an *predicate* member [sic], create one
     * and initialize its value to an empty array. */
    if (!node.hasOwnProperty(predicate.value)) node[predicate.value] = [];

    /** 3.5.7) If there is no item equivalent to *value* in the array associated
     * with the *predicate* member of node, append a reference to *value* to the
     * array. Two JSON objects are considered equal if they have equivalent
     * key-value pairs. */
    // Skipping equality test. TripleStore automatically eliminates duplicates.
    node[predicate.value].push(value);

    /** 3.5.8) If object is a blank node identifier or IRI, it might represent
     * the list node: */

    /** 3.5.8.1) If the *object* member of *node map* has no usages member, create
     * one and initialize it to an empty array. */

    // Skipping this.  Would be needed to properly support RDF Lists.
  }
  return node;
};
