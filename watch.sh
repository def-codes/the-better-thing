#!/bin/bash

# Run script build and bundler from same shell

set -e

trap 'kill %1; kill %2' SIGINT

# First build script so that bundle doesn't crash because of missing inputs.
npm run build

npm run build:script -- --watch \
    & npm run build:style -- --watch \
    & npm run bundle -- --watch \
    & wait

exit 0
