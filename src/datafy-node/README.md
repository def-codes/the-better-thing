# Datafy implementations for Node

This package contains datafy/nav implementations for selected NodeJS API's,
using the protocols provided by the `@def.codes/datafy-nav`.

Status: initial sketch

## Design notes

Following are notes related to the ongoing design of this module.

### Protocols < types

This is about the file system, not Node's API *per se*.  This implementation
acknowledges that by extending type IRI's in addition to Node classes.  However,
even that is not quite right.  This is really about datafying (though not
dereferencing) resources identified by the `file://` *protocol*, which resides
at a lower level than RDF or RDF classes.  This abstraction leak is evidenced in
a couple of ways.  For one thing, while it's good to have vocabularies for
talking about file system entities once you have located them, the resource
types `nfo:FileDataObject` and `nfo:Folder` are not ideal identifiers for
invoking the protocol in the first place, since they are addressed identically
and the requester may not know which type the thing is beforehand.  Also,
UNIX-derivative filesystems overload the term “file” anyway, in that directories
and other entities are also called “files.”  Finally, notwithstanding that `nfo`
may be a high-quality vocabulary, it lacks the kind of official status that
would belong to something as universal as files (which indeed have their own
protocol).

The conclusion is that, given that the underlying polymethod mechanism is
willing to take RDF as a first-class concept, it may be logical to consider
`@id` as well as `@type` and support protocol-based dispatch to support
lower-level extension points.

### Keys and context

Like the polymethods on which its built, this API treats RDF-based linked data
as first-class.  In JavaScript, which lacks any syntactical support for (or
notion of) namespaced keys, the simplest way to represent IRI-based properties
is to use the fully-qualified IRI's as keys, with less-than-humane results:

```json
{
  "@type"
    : "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#Folder",
  "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#url"
    : "file:///home/gavin/meld/examples"
}
```

While this “expanded form” is the most interoperable approach, since readers can
take the keys at face value, it also has some obvious drawbacks.

JSON-LD, which is a JSON-based RDF representation format officially recommended
by the W3, specifies how namespaced terms can be expressed using more idiomatic
dictionaries.  The above example can be written as follows:

```json
{
  "@context": {
    "nfo": "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#",
    "nie": "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#",
    "url": { "@type": "@id", "@id": "nie:url" }
  },
  "@type": "Folder",
  "url": "file:///home/gavin/meld/examples"
}
```

This format not only provides recognizable keys for its data values, it also
indicates that the `url` property functions as an IRI for this resource (albeit
locally).

In conjunction with techniques for making `@context`'s easily available
(e.g. through prototypes or even “blessed” prefixes), this begins to approach
the “zero edits” ideal to which JSON-LD's designer aspired.

The design tradeoff available here is to allow the use of selected JSON-LD
constructs in datafied responses.  This would confer the advantages already
outlined by the [JSON-LD
rationale](https://www.w3.org/TR/json-ld/#design-goals-and-rationale), but it
would require clients to have some level of JSON-LD support in order to
determine the qualified names of the datafied properties.  While full JSON-LD
support is non-trivial (the [official `jsonld` package's
distributable](https://cdn.jsdelivr.net/npm/jsonld@1.0.0/dist/jsonld.min.js) is
183K minified), it may be possible to select a subset with more favorable size
tradeoffs for these requirements.

Indeed, this protocol may *require* the use of a context in order to force
protocol extenders to consider the vocabularies appropriate to their domains
(much as Clojure's spec strongly encourages the use of namespaced keys when
defining specs).  Again, without first-class support for namespaced keys, there
would be no simple test for whether an implementation were making any such
attempt; whereas it would be straightforward to nominally require responses to
include or otherwise indicate a `@context`.

### Pure-data based traversal

The use of `@type` as a dispatch value opens the door to traversal using pure
data.  Code-based mechanisms (including `eval`) wind up with access to
host-bound objects that can't be represented as such.  In a way, that's the
whole *raison d'être* for these protocols.  But in userspace, which will involve
interfaces at a higher abstraction level than a REPL, datafy doesn't offer a
story on how you would get the host object in the first place.

## File system

The `fs` modules provides a datafy/nav implementation for Node's [File System
API](https://nodejs.org/api/fs.html).

### File system vocabulary

Most terms used in this datafication are drawn from the Nepomuk File Ontology
(NFO), which “provides vocabulary to express information extracted from various
sources,” including “files, pieces of software and remote hosts.”  The [Nepomuk
Annotation Ontology](http://oscaf.sourceforge.net/nao.html), which describes
user annotation of arbitrary computer resources, is also referenced.  Both
vocabularies are part of the [OSCAF “Shared Desktop Ontolofies”
project](http://oscaf.sourceforge.net/sdo.html).  Additional notes on the status
of the NFO vocabulary are at https://lov.linkeddata.es/dataset/lov/vocabs/nfo

Files are identified as having the type `nfo:FileDataObject`.  NFO also defines
`LocalFileDataObject`.  Node's File System API is limited to local files, and
specifying this could be more appropriate in some instances.  However, this data
is also intended to support communication about file systems over the wire, in
which the described item would become a `RemoteDataObject` from the reader's
point of view.  Therefore the more general term is preferred.

`nie:url` is used for file and directory locations since `nfo:fileUrl` is marked
as [deprecated](http://oscaf.sourceforge.net/nfo.html#nfo:fileUrl).

Regarding the use of `nao:lastModified`, NFO defines `fileLastModified`, but
(informally) marks it as
[“deprecated”](http://oscaf.sourceforge.net/nfo.html#nfo:fileLastModified).
This is not the case for `fileCreated` (which has a corresponding super-property
`nfo:created`), nor `fileLastAccessed` (which has no super-properties).

#### Related terms from other vocabularies

- `http://dbpedia.org/ontology/File`

- `https://schema.org/fileSize`, though it notes: “In the absence of a unit (MB,
  KB etc.), KB will be assumed.”

### See also:

- https://ieeexplore.ieee.org/document/6816297 “F2R: Publishing File Systems as
   Linked Data”

- http://s11.no/2018/arcp.html

- https://www.youtube.com/watch?v=c52QhiXsmyI

- https://commons.apache.org/proper/commons-vfs/
