#!/bin/sh

# Start a Fuseki server in the foreground using a local installation.

set -e

port="${DBPEDIA_PORT:-3030}"
dataset='dbpedia'

if [ -z "$JENA_HOME" ]; then
  >&2 echo 'abort: JENA_HOME must be set.  Is Jena installed?'
  exit 1
fi

if [ ! -d "$DBPEDIA_HOME" ]; then
  >&2 echo 'abort: DBPEDIA_HOME must be set to a directory (for run directory)'
  exit 1
fi

if [ ! -d "$DBPEDIA_FUSEKI" ]; then
  >&2 echo 'abort: DBPEDIA_FUSEKI must be set to a directory (for storage)'
  exit 1
fi

if ! which fuseki-server; then
  >&2 echo 'abort: fuseki-server command is not in path.  Is Fuseki installed?'
  exit 1
fi

cd "$DBPEDIA_HOME"

fuseki-server \
    --update \
    --loc="$DBPEDIA_FUSEKI" \
    --tdb2 \
    --port "$port" \
    "/$dataset"

exit 0
