// Datafy/nav implementation for filesystem resources via Node's File System API

import { datafy_protocol, nav_protocol } from "@def.codes/datafy-nav";
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { join, isAbsolute } from "path";

const NAV = Symbol.for("nav");

const nfo = ""; //"http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#";
const nao = ""; //"http://www.semanticdesktop.org/ontologies/2007/08/15/nao#";
const nie = ""; //"http://www.semanticdesktop.org/ontologies/2007/01/19/nie#";

/**
   Return an RDF identifier for type of file system object described by the
   given `Stats` or `Dirent` object.
 */
const determine_type = (thing: fs.Stats | fs.Dirent): string => {
  if (thing.isFile()) return `${nfo}FileDataObject`;
  if (thing.isDirectory()) return `${nfo}Folder`;
  // NFO has no terms for the remaining types.
  if (thing.isSymbolicLink()) return "SymbolicLink";
  if (thing.isSocket()) return "Socket";
  if (thing.isCharacterDevice()) return "CharacterDevice";
  if (thing.isFIFO()) return "FIFO";
};

const datafy_dirent = (dirent: fs.Dirent) => ({
  "@type": determine_type(dirent),
  [`${nfo}fileName`]: dirent.name,
});

const datafy_stats = (stats: fs.Stats) => ({
  "@type": determine_type(stats),
  [`${nfo}fileSize`]: stats.size,
  [`${nfo}fileCreated`]: stats.birthtime.toISOString(),
  [`${nao}lastModified`]: stats.birthtime.toISOString(),
  [`${nfo}fileLastAccessed`]: stats.atime.toISOString(),
});

const datafy_filesystem_path = (path: string) => {
  const stats = fs.statSync(path);

  const datafied: object = Object.assign(datafy_stats(stats), {
    [`${nie}url`]: pathToFileURL(path).toString(),
  });
  const parent = fs.realpathSync(join(path, ".."));
  // unchanged path means this is root
  if (parent && parent !== path)
    datafied[`${nfo}belongsToContainer`] = pathToFileURL(parent).toString();

  if (stats.isDirectory()) {
    const contents = fs.readdirSync(path, { withFileTypes: true });
    datafied[`${nie}hasPart`] = Object.assign(
      contents.map(entry =>
        Object.assign(datafy_dirent(entry), {
          [`${nie}url`]: pathToFileURL(join(path, entry.name)).toString(),
        })
      ),
      { [NAV]: nav_from_directory_entries(path) }
    );
  }

  return datafied;
};

/** Returns the filesystem path associated with a resource, if any. */
const contextual_path = (resource: unknown) => {
  // Could we also take `@id` here?  Is file protocol valid RDF id?
  const url = resource && resource[`${nie}url`];
  if (typeof url === "string" && url.startsWith("file://"))
    return fileURLToPath(url);
};

/** Create navigation context for an array of datafied `Dirent` objects. */
const nav_from_directory_entries = (path: string) => (
  _coll: object[],
  _key: number,
  value: object
) => datafy_filesystem_path(join(path, value[`${nfo}fileName`]));

/**
   Implements `nav` protocol for records describing filesystem resources.
   
   Currently, the only navigable point directly from here is the parent
   container.  Child locations are inside of objects inside of the "has part"
   array, which is navized by `datafy_filesystem_path`.
 */
const nav_filesystem_resource = (coll: unknown, key: any, value: unknown) => {
  if (key === `${nfo}belongsToContainer` && typeof value === "string")
    datafy_filesystem_path(fileURLToPath(value));

  return value;
};

/** Implements `datafy` protocol for records describing filesystem resources. */
const datafy_filesystem_resource = (record: unknown) => {
  const path = contextual_path(record);
  return path ? datafy_filesystem_path(path) : record;
};

const extend_fs_iri = (type: string) => ({
  datafy() {
    datafy_protocol.extend(type, datafy_filesystem_resource);
  },
  nav() {
    nav_protocol.extend(type, nav_filesystem_resource);
  },
});

export const extend_nfo$Folder = extend_fs_iri(`${nfo}Folder`);
export const extend_nfo$FileDataObject = extend_fs_iri(`${nfo}FileDataObject`);

// `Dirent` and `Stats` are not navigable as such (since they lack context).

export const extend_Dirent = {
  datafy() {
    datafy_protocol.extend(fs.Dirent, datafy_dirent);
  },
};

export const extend_Stats = {
  datafy() {
    datafy_protocol.extend(fs.Stats, datafy_stats);
  },
};
