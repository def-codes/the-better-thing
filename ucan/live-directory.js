// GOAL: Map the Turtle files in a directory into KB, updating as they change.
//
// Assumes KB is running on localhost:1234
//
// Implementation notes: everything about this is wrong.
const fs = require("fs");
const path = require("path");
const url = require("url");
const http = require("@def.codes/simple-http-client");

const TURTLE_FILE = /\.ttl$/i;

// Return the name of the graph in the dataset to associate with a local file
// containing Triples.  Basically, it's the name of the file in file protocol,
// including its extension.
const graph_name = filename => {
  return url.pathToFileURL(filename);
};

const put_turtle_request = (host, graph_iri, turtle) => {
  return {
    method: "PUT",
    url: `${host}?graph=${encodeURIComponent(graph_iri)}`,
    headers: {
      "content-type": "text/turtle",
    },
    body: turtle,
  };
};

const write_turtle_to_graph = (host, graph_iri, turtle) => {
  return http.send(put_turtle_request(host, graph_iri, turtle));
};

function write_turtle_file_to_graph(host, filename) {
  if (fs.existsSync(filename)) {
    const graph_iri = graph_name(filename);
    const turtle = fs.readFileSync(filename, "utf-8");
    write_turtle_to_graph(host, graph_iri, turtle);
  }
}

function write_file_to_graph_if_turtle(host, filename) {
  if (TURTLE_FILE.test(filename)) {
    write_turtle_file_to_graph(host, filename);
  }
}

// Detect file changes in the given directory AND check for the existence of
// changed file AND issue a PUT of its contents to a specific host using SPARQL
// Graph Store HTTP protocol.
function watch_directory(host, directory) {
  const watcher = fs.watch(directory);
  watcher.on("change", (event_type, filename) => {
    // EVENT: a file in the directory changed
    // Need to decouple this
    console.log(`event_type, filename`, event_type, filename);
    const fullpath = path.join(directory, filename);
    write_file_to_graph_if_turtle(host, fullpath);
  });
}

function read_directory(host, directory) {
  const dir = fs.readdirSync(directory);
  for (const filename of dir) {
    const fullpath = path.join(directory, filename);
    write_file_to_graph_if_turtle(host, fullpath);
  }
}

async function main(host, path) {
  // Read all the files up front
  console.log(`reading`, path);
  read_directory(host, path);

  // Monitor files for changes
  console.log(`watching`, path);
  watch_directory(host, path);
}

const [, , dirname] = process.argv;
const DEFAULT_GRAPH_HOST = "http://localhost:1234/kb/graph";
const graph_host = process.env.GRAPH_HOST || DEFAULT_GRAPH_HOST;

main(graph_host, dirname || ".");
