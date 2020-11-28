#!/bin/bash

# Run a test update against a local service instance.

set -e

DEFAULT_SPARQL='insert data {
  <http://example.com/TestThing> a <http://example.com/TestType>
}'

sparql="${1:-$DEFAULT_SPARQL}"
port="${2:-1234}"

curl \
  --silent \
  --data-urlencode "update=$sparql"\
  "localhost:$port/kb"

exit 0
