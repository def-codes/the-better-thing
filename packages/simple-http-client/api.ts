/* Type definitions for an extremely simple HTTP client.*/

import type * as http from "http";

export interface HttpRequest {
  readonly method: "GET" | "POST";
  readonly url: string;
  readonly headers?: http.IncomingHttpHeaders;
  readonly body?: string;
}

export interface HttpResponse {
  readonly status: number;
  readonly headers?: http.OutgoingHttpHeaders;
  readonly body: string;
}
