/* Type definitions for an extremely simple HTTP server pipeline.*/

type MaybeAsync<T> = T | Promise<T>;

export interface Request {
  /** Should be a defined HTTP verb, but it's up to the handler to care. */
  method: string;

  /** Will *not* include a leading slash. */
  path: string;

  query: { [key: string]: string };

  body: string;
}

export type Handler = (request: Request) => MaybeAsync<Response>;

export interface Response {
  status: number;
  message: string; // should just be a lookup.
  // Or even AsyncIterable<string | Buffer>
  body?: Buffer | string; // | Iterable<string | Buffer> like WSGI
  headers?: {};
}
