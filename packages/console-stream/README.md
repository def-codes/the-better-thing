# Console is dead!  Long live console!

This package provides a small, side-effecting module for hijacking the global
console object and replacing its default behavior with a subscribable value
stream.

## Motivation

Console logging is a pernicious habit.  I have argued that the only virtue of
`console.log` is that it helps us find structural problems, since, whenever you
need it, you have one.  Much of project MELD can be seen as a rebellion against
the hegemony of `console.log` as a means of “visibility.”

This dismal view of `console.log` seems to be a minority position.  Rather than
trying to break the habit, many developers have leaned harder on the console,
building utilities to put their precious console in ever closer reach.  I myself
am guilty of this, expanding an Emacs `lo` macro no less than a hundred times a
day.  Building on these entrenched habits, browser vendors have continued to
enhance the console's capabilities, along with the other built-in developer
tools.

This package is my way of crying uncle.  MELD identifies two coding spaces:
above and below “see level.”  Above see-level is “userland,” where models are
made from inherently visible parts and no out-of-band information channels
should be needed.  But MELD itself is built below see level, which does not
enjoy the same facilities.  There, `console.log` continues to serve as a
lifeline.

The idea of this package, then, is to integrate with an existing way of working.
While MELD does not propose an alternative to the practice of *writing*
`console.log` when needed, it does provide an alternate way of *responding* to
the messages.  Treating `console.log` like any other ingress allows driver
authors to customize the handling and presentation of log output without leaving
userland.

## Usage

Because this is a globally side-effecting module, you probably want to load it
before other packages.  You can do this by importing the module

```
import "@def.codes/console-stream";
```

or by including a direct reference as a `<script>` tag.

```
<script src="./path/to/your/scripts/@def.codes/console-stream.js"></script>
```

You use it by subscribing the `console.source` property that it adds and doing
what you please with the values.

```
if (console.source) {
  console.source.subscribe({ next({ method, args }) {
    my_view_of({ method, args });
  } })
} else {
  // sad face
}
```

Note that although the package references types from `@thi.ng/rstream`, it does
not have a runtime dependency on it.
