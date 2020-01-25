#!/bin/bash

# Run MELD module host with the indicated module.

set -e

arg="$1"

module="${1%.js}"

# npm run meld -- "./$module"
node node_modules/@def.codes/meld-cli "./$module"

exit 0
