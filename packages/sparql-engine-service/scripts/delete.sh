#!/bin/bash

# Run a graph DELETE operation against a local service instance.

set -e

graph="${1}"
port="${2:-1234}"
host="${3:-localhost}"

if [ -z "$graph" ]; then
  >&2 echo 'usage: delete.sh graph [port] [host]'
  exit 1
fi

if [ "$graph" == 'default' ]; then
  query='default'
else
  # TODO: should be URL-encoded
  query="graph=${graph}"
fi

curl \
  --silent \
  --globoff \
  --request 'DELETE' \
  "${host}:${port}/kb/graph?${query}"

exit 0
