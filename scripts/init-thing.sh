#!/bin/bash

# Perform one-time setup for subrepo.

set -e

script_dir="$(cd "$(dirname "$0")" && pwd)"
project_dir="$script_dir/.."

cd "$project_dir"

git submodule init

cd umbrella
yarn install
yarn build

exit 0
