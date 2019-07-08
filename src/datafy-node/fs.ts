import { datafy, datafy_protocol, nav_protocol } from "@def.codes/datafy-nav";
import * as fs from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { join } from "path";

// TEMP
const NAV = Symbol.for("nav");

/**
   Datafy/nav implementation for Node's [File System
   API](https://nodejs.org/api/fs.html)

   Most terms used in this datafication are drawn from the Nepomuk File Ontology
   (NFO), which “provides vocabulary to express information extracted from
   various sources,” including “files, pieces of software and remote hosts.”
   The [Nepomuk Annotation Ontology](http://oscaf.sourceforge.net/nao.html),
   which describes user annotation of arbitrary computer resources, is also
   referenced.  Both vocabularies are part of the [OSCAF “Shared Desktop
   Ontolofies” project](http://oscaf.sourceforge.net/sdo.html).  Additional
   notes on the status of the NFO vocabulary are at
   https://lov.linkeddata.es/dataset/lov/vocabs/nfo

   Related terms:

   - `http://dbpedia.org/ontology/File`

   - `https://schema.org/fileSize`, though it notes: “In the absence of a unit
     (MB, KB etc.), KB will be assumed.”
*/

const nfo = "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#";
const nao = "http://www.semanticdesktop.org/ontologies/2007/08/15/nao#";
const nie = "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#";

// Represent entry point into the file system.
class FileSystem {
  ["@type"] = `${nfo}Filesystem`;
}
// OR
// Return a datafied, navigable filesystem entry point.
const navigable_filesystem = (): object => {
  // need "navize" metadata
  return {
    "@type": `${nfo}Filesystem`
  };
};

// extend via metadata: check
// closes over context: check
// recursive: check
const navize_directory = (path: string) => {
  const contents = fs.readdirSync(path, { withFileTypes: true });
  return {
    // `nfo:fileUrl` is marked as deprecated
    // (http://oscaf.sourceforge.net/nfo.html#nfo:fileUrl)
    [`${nie}url`]: pathToFileURL(path),
    [`${nie}hasPart`]: contents.map(item =>
      Object.assign(datafy(item), {
        [NAV]: (coll, k, v) => navize_directory(join(path, v))
      })
    )
  };
};

/**
   Assign an RDF identifier to the type of file system object described by the
   given `Stats` object.

   Files are identifies as having the type `nfo:FileDataObject`.  NFO also
   defines `LocalFileDataObject`.  Node's File System API is limited to local
   files, and specifying this could be more appropriate in some instances.
   However, this data is also intended to support communication about file
   systems over the wire, in which the described item would become a
   `RemoteDataObject` from the reader's point of view.  Therefore the more
   general term is preferred.

   See also:

   - https://ieeexplore.ieee.org/document/6816297 “F2R: Publishing File Systems
     as Linked Data”

   - http://s11.no/2018/arcp.html

   - https://www.youtube.com/watch?v=c52QhiXsmyI

   - https://commons.apache.org/proper/commons-vfs/
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

export const extend_nfo$Folder = {
  datafy() {
    datafy_protocol.extend(`${nfo}Folder`, rec => {
      const url = rec[`${nie}url`];
      const path = fileURLToPath(url);
      return;
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

/**
   Regarding the use of `nao:lastModified`, NFO defines `fileLastModified`, but
   (informally) marks it as
   [“deprecated”](http://oscaf.sourceforge.net/nfo.html#nfo:fileLastModified).
   This is not the case for `fileCreated` (which has a corresponding
   super-property `nfo:created`), nor `fileLastAccessed` (which has no
   super-properties).
 */
export const extend_Stats = {
  datafy() {
    datafy_protocol.extend(fs.Stats, stats => ({
      "@type": determine_type(stats),
      [`${nfo}fileSize`]: stats.size,
      [`${nfo}fileCreated`]: stats.birthtime.toUTCString(),
      [`${nao}lastModified`]: stats.birthtime.toUTCString(),
      [`${nfo}fileLastAccessed`]: stats.atime.toUTCString()
    }));
  },
  nav() {
    // @ts-ignore : matching wrong overload
    nav_protocol.extend(fs.Stats, (obj, key, value) => {
      // obj may be a datafied value
      // what here?
    });
  }
};
