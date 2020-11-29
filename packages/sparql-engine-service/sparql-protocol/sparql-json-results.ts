// DUPLICATED: in (Mindgrub swymbase/packages/@sparql/protocol-client)

/*
 * TypeScript translation of https://www.w3.org/TR/sparql11-results-json/
 */

export const SPARQL_JSON_RESULTS = "application/sparql-results+json";

/**
 * The format is designed to be a complete representation of the information in
 * the query results.
 *
 * https://www.w3.org/TR/sparql11-results-json/#introduction
 *
 * The results of a SPARQL Query are serialized in JSON as a single top-level
 * JSON object. This object has a "head" member and either a "results" member or
 * a "boolean" member, depending on the query form.
 */
export type SparqlJsonResults = SparqlAskResults | SparqlSelectResults;

/**
 * The results of a SPARQL `SELECT` query are serialized as an array of bindings
 * of variables.  The value of the "`head`" key is an array of all variables
 * projected in the query's `SELECT` clause.
 *
 * https://www.w3.org/TR/sparql11-results-json/#select-results-form
 */
export interface SparqlSelectResults {
  /**
   * The "head" member gives the variables mentioned in the results and may
   * contain a "link" member.
   *
   * https://www.w3.org/TR/sparql11-results-json/#select-head
   */
  readonly head: {
    /**
     * The "`vars`" member is an array giving the names of the variables used in
     * the results. These are the projected variables from the query. A variable
     * is not necessarily given a value in every query solution of the results.
     *
     * The order of variable names should correspond to the variables in the
     * SELECT clause of the query, unless the query is of the form `SELECT *` in
     * which case order is not significant.
     *
     * https://www.w3.org/TR/sparql11-results-json/#select-vars
     */
    readonly vars: readonly string[];

    /**
     * The optional "`link`" member gives an array of URIs, as strings, to refer
     * for further information. The format and content of these link references
     * is not defined by this document.
     *
     * https://www.w3.org/TR/sparql11-results-json/#select-link
     */
    readonly link?: readonly string[];
  };

  /**
   * The value of the "`results`" member is an object with a single key,
   * "`bindings`".
   *
   * https://www.w3.org/TR/sparql11-results-json/#select-results
   */
  readonly results: {
    /**
     * The value of the "`bindings`" member is an array with zero or more
     * elements, one element per query solution. Each query solution is a JSON
     * object. Each key of this object is a variable name from the query
     * solution. The value for a given variable name is a JSON object that
     * encodes the variable's bound value, an RDF term. There are zero elements
     * in the array if the query returned an empty solution sequence. Variables
     * names do not include the initial "?" or "$" character. Each variable name
     * that appears as a key within the "`bindings`" array will have appeared in
     * the "`vars`" array in the results header.
     *
     * A variable does not appear in an array element if it is not bound in that
     * particular query solution.
     *
     * The order of elements in the bindings array reflects the order, if any,
     * of the query solution sequence.
     *
     * If the query returns no solutions, an empty array is used.
     *
     * https://www.w3.org/TR/sparql11-results-json/#select-bindings
     */
    readonly bindings: ReadonlyArray<{ readonly [variable: string]: RDFTerm }>;
  };
}

/**
 * An RDF term (IRI, literal or blank node) is encoded as a JSON object. All
 * aspects of the RDF term are represented. The JSON object has a "`type`"
 * member and other members depending on the specific kind of RDF term.
 *
 * The blank node label is scoped to the results object. That is, two blank
 * nodes with the same label in a single SPARQL Results JSON object are the same
 * blank node. This is not an indication of any internal system identifier the
 * SPARQL processor may use. Use of the same label in another SPARQL Results
 * JSON object does not imply it is the same blank node.
 *
 * https://www.w3.org/TR/sparql11-results-json/#select-encode-terms
 */
// Not to be confused with the unofficial RDF/JS data model
export type RDFTerm =
  | Term<"uri"> // IRI
  | Term<"literal"> // Literal string
  | (Term<"literal"> & { readonly "xml:lang": string }) //Language-tagged string
  | (Term<"literal"> & { readonly datatype: string }) // Datatyped string (with datatype IRI)
  | Term<"bnode">; //Blank node, with label

interface Term<T> {
  readonly type: T;
  readonly value: string;
}

/**
 * The results of a SPARQL `ASK` query are serialized as a boolean value, giving
 * the result of the query evaluation.
 *
 * https://www.w3.org/TR/sparql11-results-json/#ask-result-form
 */
export interface SparqlAskResults {
  readonly head: {
    /**
     * The "link" member has the same format as the SELECT "link" member.
     *
     * https://www.w3.org/TR/sparql11-results-json/#ask-link
     */
    readonly link?: readonly string[];
  };

  /**
   * The result of an `ASK` query form are encoded by the "`boolean`" member,
   * which takes either the JSON value `true` or the JSON value `false`.
   *
   * https://www.w3.org/TR/sparql11-results-json/#ask-boolean
   */
  readonly boolean: boolean;
}
