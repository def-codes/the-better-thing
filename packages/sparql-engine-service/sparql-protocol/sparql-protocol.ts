// DUPLICATED: in (Mindgrub swymbase/packages/@sparql/protocol-client)

/*
 * TypeScript translation of https://www.w3.org/TR/sparql11-protocol/
 */

import { SparqlJsonResults } from "./sparql-json-results";

/* === Request === */

/**
 * The SPARQL Protocol consists of two HTTP operations: a query operation for
 * performing SPARQL Query Language queries and an update operation for
 * performing SPARQL Update Language requests.
 *
 * https://www.w3.org/TR/sparql11-protocol/#intro
 */
// export type SparqlRequest = SparqlQueryOperation | UpdateOperation;

/**
 * The `query` operation is used to send a SPARQL query to a service and receive
 * the results of the query.
 *
 * https://www.w3.org/TR/sparql11-protocol/#query-operation
 */
export interface SparqlQueryOperation {
  /**
   * Client requests for this operation **must** include exactly one SPARQL
   * query string
   */
  readonly query: string;
  readonly default_graph_uri?: string | readonly string[];
  readonly named_graph_uri?: string | readonly string[];
}

/**
 * The `query` request's parameters **must** be sent according to one of these
 * three options
 */
export type QueryHttpMethod =
  | "get"
  | "post_with_encoded_params"
  | "post_direct";

/**
 * The `update` operation is used to send a SPARQL update request to a service.
 *
 * https://www.w3.org/TR/sparql11-protocol/#update-operation
 */
export interface UpdateOperation {
  /**
   * Client requests for this operation **must** include exactly one SPARQL
   * update request string
   */
  readonly update: string;
  readonly using_graph_uri?: string | readonly string[];
  readonly using_named_graph_uri?: string | readonly string[];
}

/**
 * The `update` request's parameters **must** be sent according to one of these
 * two options
 */
export type UpdateHttpMethod = "post_with_encoded_params" | "post_direct";

interface Req<R, M> {
  /**
   * The URI at which a SPARQL Protocol service listens for requests from SPARQL
   * Protocol clients.
   */
  readonly endpoint: string;
  readonly operation: R;
  readonly method?: M;
  readonly accept?: readonly string[];
}
export type SparqlRequest =
  | Req<UpdateOperation, UpdateHttpMethod>
  | Req<SparqlQueryOperation, QueryHttpMethod>;

/* === Response === */

/**
 * The response body of a successful query operation with a 2XX response is
 * either
 *
 * - a SPARQL Results Document in XML, JSON, or CSV/TSV format (for SPARQL Query
 *   forms SELECT and ASK); or,
 *
 * - an RDF graph serialized, for example, in the RDF/XML syntax, or an
 *   equivalent RDF graph serialization, for SPARQL Query forms DESCRIBE and
 *   CONSTRUCT)
 *
 * https://www.w3.org/TR/sparql11-protocol/#query-success
 */
export type SparqlQuerySuccessResponse = SparqlResults | RDFGraph;

export type SparqlResults =
  | SparqlXmlResults
  | SparqlJsonResults
  | SparqlCsvResults
  | SparqlRdfResults;

export interface SparqlXmlResults {}
export interface SparqlCsvResults {}
export interface SparqlRdfResults {}

// Treat all RDF graph responses as JSON-LD object?
type RDFGraph = object;
