define([], () => {
  // See packages/datafy-node/implementations/fs.ts
  const nfo = "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#";
  const nao = "http://www.semanticdesktop.org/ontologies/2007/08/15/nao#";
  const nie = "http://www.semanticdesktop.org/ontologies/2007/01/19/nie#";

  return {
    "@graph": [
      {
        "@id": "file:///home/gavin/research/the-better-thing",
        "@type": `${nfo}Folder`,
        [`${nie}url`]: "file:///home/gavin/research/the-better-thing",
        [`${nfo}fileName`]: "the-better-thing",
        [`${nie}hasPart`]: [
          "file:///home/gavin/research/the-better-thing/index.html",
          "file:///home/gavin/research/the-better-thing/index.css",
        ],
      },
      {
        "@id": "file:///home/gavin/research/the-better-thing/index.html",
        "@type": `${nfo}FileDataObject`,
        [`${nie}url`]: "file:///home/gavin/research/the-better-thing/index.html",
        [`${nfo}fileName`]: "index.html",
        [`${nfo}fileSize`]: 39240,
        // http://oscaf.sourceforge.net/nfo.html#nfo:fileCreated
        // Range is xsd:dateTime.  There are better runtime options though...
        [`${nfo}fileCreated`]: "2020-08-05T01:10:03.535Z",
        [`${nao}lastModified`]: "2020-08-05T01:10:03.535Z",
        [`${nfo}fileLastAccessed`]: "2020-08-05T01:10:03.535Z",
      },
      {
        "@id": "file:///home/gavin/research/the-better-thing/index.css",
        "@type": `${nfo}FileDataObject`,
        [`${nie}url`]: "file:///home/gavin/research/the-better-thing/index.css",
        [`${nfo}fileName`]: "index.css",
        [`${nfo}fileSize`]: 3348,
        [`${nfo}fileCreated`]: "2020-08-05T01:10:03.535Z",
        [`${nao}lastModified`]: "2020-08-05T01:10:03.535Z",
        [`${nfo}fileLastAccessed`]: "2020-08-05T01:10:03.535Z",
      },
    ],
  };
});
