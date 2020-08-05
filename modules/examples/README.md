# Notes

## Implicit bnodes ftw?

Regarding things like this

```javascript
define([], () => {
  return {
    "@graph": [
      {
        "@id": "<localhost>/module-A",
        "https://def.codes/depends_on": [
          "<localhost>/module-B",
          "<localhost>/module-D",
        ],
```

Will JSON-LD assume distinct bnodes for each item if they're not given?

Would prefer it since they only have to be unique within this graph. Would be
easier and shorter than UUID

The labels should be invisible, if not nonexistent, in userland. You can't use
bnode labels. They are like unique symbols with no special string. They are
runtime-only references, and nothing more, good for O(1) collection and presence
testing.

## Implicit local names

When I _do_ care about local names, can I make JSON-LD understand the keys of
the top-level object as defining _nodes_ by those names, as opposed to
properties?
