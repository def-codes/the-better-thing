import * as http from "http";
import * as https from "https";
import { parse } from "url";
import type { HttpRequest, HttpResponse } from "./api";

/** Return HTTP Basic Auth header for the given username and password. */
export const basic_auth = (auth: { username: string; password: string }) => ({
  Authorization: `Basic ${Buffer.from(
    `${auth.username}:${auth.password}`
  ).toString("base64")}`,
});

/** Extremely basic async HTTP request/response function. */
export const send = async (request: HttpRequest): Promise<HttpResponse> => {
  const url = parse(request.url);
  return new Promise((resolve, reject) => {
    const headers = request.headers ?? {};

    if (request.body) {
      headers["content-length"] = Buffer.byteLength(request.body).toString();
    }

    const raw_request = (url.protocol === "https:" ? https : http).request(
      {
        method: request.method ?? "GET",
        ...url,
        headers,
      },
      raw_response => {
        const buffer: string[] = [];
        raw_response.setEncoding("utf8");
        raw_response.on("data", chunk => buffer.push(chunk));
        raw_response.on("end", () => {
          resolve({
            // TS: Status code is always defined for client requests
            status: raw_response.statusCode!,
            headers: raw_response.headers,
            body: buffer.join(""),
          });
        });
        raw_request.on("error", reject);
      }
    );

    if (request.body) {
      raw_request.write(request.body);
    }
    raw_request.end();
  });
};
