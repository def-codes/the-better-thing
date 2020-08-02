#!/bin/bash

# Upload selected files from dbpedia source into configured local instance.

set -e

script_dir="$(cd "$(dirname "$0")" && pwd)"

if [ ! -d "$DBPEDIA_SOURCE" ]; then
    >&2 echo 'abort: DBPEDIA_SOURCE must be set to a directory (with RDF files)'
    exit 1
fi

load_ttl() {
    name="$1"
    file="$DBPEDIA_SOURCE/$name"
    
    if [ ! -f "$file" ]; then
        >&2 echo "abort: no such file: $file"
        exit 1
    fi
    
    echo "Importing $name..."

    "$script_dir/upload.sh" "$file"
}

# load_ttl 'categories_lang=en_labels.ttl'
# load_ttl 'labels_lang=en.ttl'
load_ttl 'infobox-properties_lang=en.ttl'

exit 0
