# HDOM regions

A mechanism for dynamically associating DOM “regions” with content. A region is
a contiguous subtree bounded by specially-marked nodes. The model allows you to
treat a DOM branch as logically partitioned into a set of exclusive, labeled
regions whose content can be defined independently at runtime.

## Motivation

It is common to think of two neighboring parts of a DOM tree as independent:
they may represent different things, they may change in different ways and under
different conditions. This is easy because sibling subtrees happen to be
disjunct—mutually exclusive—so there is no question of what belongs to whom
between the two of them.

For sections with a containment relationship, we have no such boundaries. The
containing node seems to have primacy over the contained node. In particular, it
is hard to avoid the ancestor node having complete “knowledge” of the
descendant.

Yet we may well wish to have such boundaries. We may well think of such areas as
being independent.

Component trees are locked into code. As currently practiced, in order to change
how components are constituted, you have to change the code. The only way around
this would be to create special components that take their cues from data that
you can change externally. But such a technique would apply only to those
components; in general, it would not be possible to change things “at runtime.”

## Design

a.k.a treat a (dom) tree as a process with central input and output streams

Tied to an implementation for updating (hdom)

Synchronizes content with names. you can provide content to associate with a
location before the location is available.

Note we use the term ‘id’, but a region id can be used in more than one place,
in which case any defined content will appear in all instances.

## How does it work?

The way that content is associated with locations using an ongoing process.

If a new placeholder is added that was not there before, then it's registered.

If a placeholder is added that _was_ there before, then its existing content is
left as-is.

## Implementation

The mechanism keeps a cache of all content, including content that's already
been applied to the “actual” dom tree as well as content that hasn't been
mounted yet.

## Placeholders

Placeholders are named locations in a template.

The content of placeholders can be set at any time.

Templates simply ignore placeholders. They act as a boundary of the template's
jurisdiction.

Nor does a template does “wait for” content to be assigned to any placeholders.
Templates will be shown as soon as their _own_ content is available; this is
entirely separate from the setting of placeholders' content.

Currently, a placeholder requires its own container element separate from any
assigned content.

In practice, a placeholder and a template are essentially the same thing. This
only works when the structure of the tree is uniform.

## Templates

A template is a stateful junction between the dom process and a node in an
implementation's "component" tree.

A template can be in one of several states:

- created. There is a stateful instance with no content source. In this state,
  the template acts as if empty and will not emit anything (except maybe a
  container?)
- connected (there is a source)
- unmounted. The component should be inaccessible by any references outside of
  the mechanism and should be garbage collected shortly.

## Open questions

If you don't know whether there will later be content for a given id, then how
do you know when to remove anything from the cache?

# hdom process

System of consumers and providers

Coordinated by ID

Tree segments start from a node and go down to (1) end or (2) placeholder.

A template may contain placeholders

A placeholder has an ID

API providers content for a given ID

When a mount node is available for that ID, the content is written or updated.

The templates form a virtual tree

An objective of the system is that updates are proportional to the size of the
template, not the size of the subtree.

## hdom implementation details

for each node in the tree, there is a subscription that feeds it templates using
an hdom transducer

When content has not been defined for an ID, then a placeholder referencing that
ID will have no content (OR A DUMMY ELEMENT? undefined)

When content has been defined for an ID AND an element is mounted, then the
content will be sent to that element.

The “trick” to making efficient updates is that diffing and updating must stop
at placeholder nodes

## Invariants

When content is defined:

- Any elements mounted for that id are updated

- Any node that contained a reference to this placeholder/region and had _not_
  mounted it should be re-rendered

This means that defining content can lead to zero, one, or two updates (per
instance):

- zero if it has no mounted element
- one if it has a mounted element
- two if it has ... but that would mean that it wasn't mounted

When a node is updated:

- if the template includes no placeholders, then it's identical to normal hdom
  behavior.

- if the template includes a placeholder for which **no** content is defined,
  then nothing is emitted in that location (or a dummy element would be okay)

- if the template includes a placeholder for which content is defined, then the
  placeholder's content appears in the place in the template that it was holding
  (replacing any dummy element that might have been used before)

- if the template includes a placeholder for which content _was_ defined but is
  now undefined (PROVISIONAL), then the template is re-rendered with empty
  content (or a dummy element) in that location

This implies that

- we need to do bookkeeping with the placeholder tree

  - and, it appears, its inverse

- we need to keep the element associated with a placeholder consistent across
  renders of its parent

- it's the template component, not the placeholder, that needs to have lifecycle
