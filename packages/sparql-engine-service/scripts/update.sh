#!/bin/bash

# Run a test update against a local service instance.

set -e

DEFAULT_SPARQL='insert data {
  <http://example.com/TestThing> a <http://example.com/TestType>
}'

sparql="${1:-$DEFAULT_SPARQL}"
port="${2:-1234}"
host="${3:-localhost}"

curl \
  --silent \
  --globoff \
  --data-urlencode "update=$sparql"\
  "${host}:${port}/kb"

exit 0
