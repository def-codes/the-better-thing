#!/bin/bash

# Run bundler for all packages in thi.ng submodule, to get UMD artifacts,
# because I don't see a script in the repo itself that does this.

set -e

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$script_dir/.."

cd "$project_dir"

cd umbrella/packages

for package in *; do
	echo $package ...
	pushd $package
	node ../../scripts/bundle-module all
	popd
done

exit 0
