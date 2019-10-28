import { Handler } from "./api";
import { STATUS } from "./constants";
import * as fs from "fs";
import * as _path from "path";

export const MIME_TYPES = {
  ".avi": "video/avi",
  ".bmp": "image/bmp",
  ".css": "text/css",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".htm": "text/html",
  ".html": "text/html",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript",
  ".json": "application/json",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg3",
  ".mpa": "audio/mpeg",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".oga": "audio/ogg",
  ".ogg": "application/ogg",
  ".ogv": "video/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".txt": "text/plain",
  ".wav": "audio/wav",
  ".xml": "text/xml",
};

interface Options {
  /** The absolute, physical path to the directory root. */
  root: string;

  /** Name of the file to look for when a directory is requested. */
  default_document: string;
}

const DEFAULT: Options = {
  root: ".",
  default_document: "index.html",
};

export const with_static_files = (
  options: Partial<Options>
): Handler => request => {
  const { root, default_document }: Options = { ...DEFAULT, ...options };

  const file_path = _path.resolve(root, request.path);

  let stat;
  try {
    stat = fs.statSync(file_path);
  } catch (error) {
    if (error.code === "EACCES") return STATUS.UNAUTHORIZED;
    if (error.code === "ENOENT") return STATUS.NOT_FOUND;
    throw error;
  }

  let file_to_serve: typeof file_path;
  if (stat.isFile()) file_to_serve = file_path;
  else if (stat.isDirectory()) {
    const index = _path.join(file_path, default_document);
    if (fs.existsSync(index)) file_to_serve = index;
    else return STATUS.UNAUTHORIZED;
  } else throw new Error("Unsupported file system entry");

  const extension = _path.extname(file_to_serve);
  const mime_type = MIME_TYPES[extension] || "application/octet-stream";
  const content = fs.readFileSync(file_to_serve);

  return {
    ...STATUS.OK,
    content,
    headers: {
      "Content-type": mime_type,
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  };
};
