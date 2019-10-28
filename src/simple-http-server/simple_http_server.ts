import * as http from "http";
import { parse as parse_url } from "url";
import { Request, Response, Handler } from "./api";
import { STATUS } from "./constants";
import { with_error_boundary } from "./with_error_handler";
import { Readable } from "stream";
import { dictionary_from } from "./dictionary_from";

/** Return a plain javascript object representing a given URL query string. */
const deserialize_query = (query: string) =>
  dictionary_from(
    query.split("&").map(_ => _.split("=")),
    ([_, value]) => decodeURIComponent(value),
    ([key]) => decodeURIComponent(key)
  );

const read_to_end = (stream: Readable) =>
  new Promise<string>((resolve, reject) => {
    const buffer: string[] = [];
    stream.setEncoding("utf-8");
    // String is passed when default encoding is set.
    stream.on("data", chunk => buffer.push(chunk as string));
    stream.on("end", () => resolve(buffer.join("")));
    stream.on("error", reject);
  });

interface Options {
  port: number;
  handler: Handler;
}
export type StaticServerOptions = Options;

const DEFAULT: Options = {
  port: 8800,
  handler: () => STATUS.OK,
};

const trim_slashes = s => s.replace(/^\/+|\/+$/, "");

export const create_server = (options: Partial<Options>) => {
  const { port, handler } = { ...DEFAULT, ...options };

  const handle = with_error_boundary({ handler });

  const server = http.createServer((req, res) => {
    const respond = (response: Response) => {
      res.statusCode = response.status;
      res.statusMessage = response.message;

      if (response.headers)
        for (let key of Object.keys(response.headers))
          res.setHeader(key, response.headers[key]);

      const content = response.content || response.message || "";

      // Set this regardless of what handler says.
      res.setHeader("Content-length", content.length);

      res.end(content);
    };

    read_to_end(req)
      .then(body => {
        if (!req.url || !req.method) return STATUS.BAD_REQUEST;
        const url = parse_url(req.url);
        const request: Request = {
          method: req.method,
          path: trim_slashes(url.pathname || ""),
          query: deserialize_query(url.query || ""),
          body,
        };

        return handle(request);
      })
      .then(respond);
  });

  server.listen(port, () => console.log(`serving on ${port}`));
  return server;
};
