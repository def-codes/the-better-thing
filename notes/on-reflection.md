# Reflecting reality in self-reporting systems

The flip side of reification is *reflection*.

If reification is the ability to turn a description into a reality, reflection
is the complementary ability to describe an existing system.  To reflect a
changing system (as all are), it is necssary to be able to listen for updates,
which in turn means that the thing must be able to report said updates.

In a reified system (or at least, the reified parts of a system), *assertions*
(largely in the form of descriptions) are turned into a reality.

In a reflected system (or at least, the reflected parts of a system),
*notifications* (in the forms of message events) are incorporated into a
description of a system.

## Hybrid system

Difficulties arise when a system includes parts that are both reflected and
reified.

It's not necessary that you would have a reflection system hooked up in the case
of an assertion-based system.

However, it's clear that a typical system is unlikely to be fully of one type or
the other.

### Provenance of claims

For example, in an assertion-based system, you can state that a resource X
exists, and later assert various properties of X.  The (reification) system will
create or update runtime objects to match the given description.  If the things
being thus created are also capable of reflection-based usage, they may emit
notifications about themselves.  In theory, this information should not
contradict what has been asserted about X.  But even so, it may extend beyond
what has been asserted about X as such.  In this case, I think provenance is the
correct thing for handling this: the provenance of assertions should be known,
and the system can assign internal provenance for facts that come from
reflection system.

### Systems as scopes

“The system” acts as a scoping container for all of the resources knowable to
it.  This scope is a *de facto* graph comprising all the facts it contains.

For this to work, some kind of reference to the system in scope has to be
propagated through existing things into new things.

There are various ways to accomplish this.

One approach would be to use a predefined global singleton.  However, in theory,
there could be multiple systems within a runtime.

Another approach would be for consuming code to use such a singleton as a
registry which can reference the system in question via a key.

Other alternatives require reference passing, which we want to avoid.  But it
would prevent the need to refer to a global singleton, which is almost as bad.

### Identifying subsystems

For various reasons, including the ability to visualize anything short of a full
system, we need a way to *identify* and *watch* subsets of the full graph.
