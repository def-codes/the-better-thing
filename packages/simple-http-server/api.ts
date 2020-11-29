/* Type definitions for an extremely simple HTTP server pipeline.*/

type MaybeAsync<T> = T | Promise<T>;

export interface Request {
  /** Should be a defined HTTP verb, but it's up to the handler to care. */
  readonly method: string;

  /** Will *not* include a leading slash.  Also doesn't include the query. */
  readonly path: string;

  /** Dictionary of the decoded, possibly-multivalued query parameters. */
  readonly query: { readonly [key: string]: string | readonly string[] };

  /** Dictionary of the decoded, possibly-multivalued request headers. */
  // TODO: implement this
  readonly headers?: { readonly [key: string]: string | readonly string[] };

  readonly body: string;
}

export type Handler = (request: Request) => MaybeAsync<Response>;

export interface Response {
  readonly status: number;
  readonly message: string; // should just be a lookup.
  // Or even AsyncIterable<string | Buffer>
  readonly body?: Buffer | string; // | Iterable<string | Buffer> like WSGI
  readonly headers?: {};
}
