// GOAL: Map the Turtle files in a directory into KB, updating as they change.
//
// Assumes KB is running on localhost:1234
//
// Implementation notes: everything about this is wrong.
const fs = require("fs");
const url = require("url");
const http = require("@def.codes/simple-http-client");

const TURTLE_FILE = /\.ttl$/i;

// Return the name of the graph in the dataset to associate with a local file
// containing Triples.  Basically, it's the name of the file in file protocol,
// including its extension.
const graph_name = filename => {
  return url.pathToFileURL(filename);
};

// Detect file changes in the given directory AND check for the existence of
// changed file AND issue a PUT of its contents to a specific host using SPARQL
// Graph Store HTTP protocol.
function watch_directory(path) {
  const watcher = fs.watch(path);
  watcher.on("change", (event_type, filename) => {
    // EVENT: a file in the directory changed
    // console.log(`event_type, filename`, event_type, filename);
    if (TURTLE_FILE.test(filename)) {
      // Let's put this to the KB
      // Graph name is based on the filename
      // So like yeah if we had IPC/shared mem etc, we could do this w/o HTTP
      if (fs.existsSync(filename)) {
        const graph_iri = graph_name(filename);
        const body = fs.readFileSync(filename, "utf-8");
        const put_request = {
          method: "PUT",
          url: `http://localhost:1234/kb/graph?graph=${encodeURIComponent(
            graph_iri
          )}`,
          headers: {
            "content-type": "text/turtle",
          },
          body,
        };
        // console.log(
        //   `let's write this to ${graph_iri}`,
        //   JSON.stringify(put_request, null, 2)
        // );

        http.send(put_request).then(response => {
          console.log(`PUT response:`, response);
        });
      }
    }
  });
}

async function main(path) {
  console.log(`watching`, path);

  watch_directory(path);
}

const [, , dirname] = process.argv;
main(dirname || ".");
