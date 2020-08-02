#!/bin/bash

# Upload a given file to the configured Dbpedia server instance over HTTP.

set -e

file="$1"
port="${DBPEDIA_PORT:-3030}"
dataset='dbpedia'

if [ ! -f "$file" ]; then
    >&2 echo "abort: no such file: $file"
    exit 1
fi

curl \
    --progress \
    -H 'Content-type: text/turtle' \
    --data "@$file" \
    "http://localhost:$port/$dataset/data"

exit 0
