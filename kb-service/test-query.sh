#!/bin/bash

# Run a test query against a local service instance.

set -e

DEFAULT_SPARQL='select * where { ?s a ?o }'

sparql="${1:-$DEFAULT_SPARQL}"
port="${2:-1234}"

curl \
  --silent \
  --data-urlencode "query=$sparql"\
  "localhost:$port/kb"

exit 0
