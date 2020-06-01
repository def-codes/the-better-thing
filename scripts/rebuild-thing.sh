#!/bin/bash

# Rebuild (and rebundle) a thi.ng package in the submodule.

set -e

package="$1"

if [ -z "$package" ]; then
	>&2 echo "abort: package name is required"
	exit 1
fi

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$script_dir/.."

cd "$project_dir"

cd umbrella
`npm bin`/lerna run build --scope "@thi.ng/$package"

pushd packages/$package
node ../../scripts/bundle-module all
popd

`npm bin`/lerna run test --scope "@thi.ng/$package"

exit 0
