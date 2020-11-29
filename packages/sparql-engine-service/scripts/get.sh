#!/bin/bash

# Run a graph GET operation against a local service instance.

set -e

graph="${1:-default}"
port="${2:-1234}"
host="${3:-localhost}"

if [ "$graph" == 'default' ]; then
  query='default'
else
  # TODO: should be URL-encoded
  query="graph=${graph}"
fi

curl \
  --silent \
  --globoff \
  --request 'GET' \
  "${host}:${port}/kb/graph?${query}"

exit 0
