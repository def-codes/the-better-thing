# Node viewer CLI

This is an extension to `@def.codes/node-web-presentation` to support
command-line usage.  Currently the main reason for having a separate package is
to avoid modifying the build/bundle setup to support creating a separate
distributable for the package.  You can't have the launcher command also be the
package that exports utilities that might be imported by a launched package.
Don't think about it too hard.
