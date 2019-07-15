# More notes

## what if I just want to see the keys (still lacking a good answer)

-- What if I just want to see what keys are in the bags?
   Or some indication of the type of thing they are?
   Like, I'm okay just saying “give me the types of thing here.”
-- Cool.  When do you want to request this?
-- When I'm presenting a lot of things.
-- Define “a lot”.

-- Like, enough that I think giving them a charter to take more liberties
   would be overspending our investment here.

-- I'm still waiting for my answer.  How do I see what's in the bags?
And how can I express an intent whose type may not be recognized at the
time that I express it?  But which nevertheless matches later when a
handler materializes?

-- How do I say, show me the Keys?  How do I say, the Keys shall be shown?

-- Just make a Keys protocol.  That mostly delegates to built-ins of the
   same name.  Same for Values, same for Entries.  These are properties
   in a collections ontology.

-- Okay, but then how do you trigger it from userland?  What do you say?

## Path in hash

-- Suppose we interpret the hash as possibly describing a *path*

-- (Really, since you can have multiple matches for any property, you're
   describing a subgraph query.)

-- (I mean, if you click on a specific link... you descend along the
   relevant property.  But that implicitly half-includes any other
   resources related by the same property.  This is a feature of
   multi-valued properties.)

## Container and composite semantics

But you want to map "hasPart" rather than "iterable" class

Iterable implies something different.  it needs to materialize the parts

Do we consider the iterable to be stateful?

Hard questions.

In other words, we don't want to be dealing in terms of iterable right here.  We
can assume effective simultenaeity for purposes of forking paths from
collections.

Iterable is lower-level, we don't want to summon it, by requiring
knowledge of it, until absolutely needed.

Collection datatypes carry *some* semantics.

Collections can be
- keyed by string (Dictionary)
- keyed by arbitrary value (Map)
- indexed (Vector)
- hashed (Set)
- recursive (Tree)
- chained (List),
- or unrelated (Bag/MultiSet).

While this doesn't tell you anything about the collection's content from
a domain perspective, it tells you something about the kind of algorithms
that perform well with that sort of thing.  It narrows the space of
likely usages, past or future.
