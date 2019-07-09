// Datafy/nav implementation for Node's File System API

// There is nothing navigable from both Stats and Dirent.

import { datafy, datafy_protocol, nav_protocol } from "@def.codes/datafy-nav";
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { join } from "path";

// TEMP
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

const datafy_stats = (stats: fs.Stats) => ({
  "@type": determine_type(stats),
  [`${nfo}fileSize`]: stats.size,
  [`${nfo}fileCreated`]: stats.birthtime.toUTCString(),
  [`${nao}lastModified`]: stats.birthtime.toUTCString(),
  [`${nfo}fileLastAccessed`]: stats.atime.toUTCString()
});

const datafy_directory = (path: string) => {
  const contents = fs.readdirSync(path, { withFileTypes: true });
  return {
    [`${nie}url`]: pathToFileURL(path).toString(),
    [`${nie}hasPart`]: contents.map(item =>
      Object.assign(datafy(item), {
        [`${nie}url`]: pathToFileURL(join(path, item.name)).toString()
      })
    )
  };
};

const datafy_file = (path: string) => {
  const base = Object.assign(datafy_stats(fs.statSync(path)), {
    [`${nie}url`]: pathToFileURL(path).toString()
  });
  const parent = fs.realpathSync(join(path, ".."));
  if (parent) base[`${nfo}belongsToContainer`] = parent;

  return base;
};

export const extend_nfo$Folder = {
  datafy() {
    datafy_protocol.extend(`${nfo}Folder`, rec => {
      const url = rec[`${nie}url`];
      return url ? datafy_directory(fileURLToPath(url)) : rec;
    });
  }
};

export const extend_nfo$FileDataObject = {
  datafy() {
    datafy_protocol.extend(`${nfo}FileDataObject`, rec => {
      const url = rec[`${nie}url`];
      return url ? datafy_file(fileURLToPath(url)) : rec;
    });
  },
  nav() {
    // We will interpret `value` as a relative path.
    // We will ignore `key`.
    //
    // We will ignore coll?  Or, we will treat `coll` as someting that we expect
    // to have a URI property.
    nav_protocol.extend(`${nfo}FileDataObject`, (coll, key, value) => {
      const url = coll[`${nie}url`];
      return url ? datafy_file(fileURLToPath(url)) : rec;

      //
      // navigate
    });
  }
};

export const extend_Dirent = {
  datafy() {
    datafy_protocol.extend(fs.Dirent, dirent => ({
      "@type": determine_type(dirent),
      [`${nfo}fileName`]: dirent.name
    }));
  },
  // Is this meaningful here?  Dirent objects don't have context.  They could
  // support navigation only with a context that includes their location.
  nav() {
    // @ts-ignore : matching wrong overload
    nav_protocol.extend(fs.Dirent, (obj, key, value) => {
      // what here?
      return {};
    });
  }
};

export const extend_Stats = {
  datafy() {
    datafy_protocol.extend(fs.Stats, datafy_stats);
  }
};
