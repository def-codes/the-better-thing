# On watching processs

Processes must be watchable.  The whole difference between a process and any
other thing is that processes are a locus of activity and (potentially) changes.

what is it that gets watched?  state? the datafication (description)?
  
is describable a separate interface?  isn't it identical to datafy?  Which is in
turn identical to unreify?
  
if a process supports event listeners (notify), what does it notify about?  the
INotify interface requires identified events (which is good) but not typed
events (which is probably fine)
  
state machine on life cycle? (alive -> dead)

does it need to be possible to watch only “part” of a process?

a change in something related to a process does not count as a change to the
process for watch purposes

and what about when things go away?
that's where you need `process.die`

implication of all this is that
- you really build the watcher on (duh) `IWatch`
- putting description over the wire requires unreify/describe/datafy

## Requirements

What matters is that you can:
- at a single point, construct the current process/thing graph of a system
- get notified every time something in that has changed
- in a “localized” way: i.e. not necessarily for the whole system every time
- efficiently (without an O(N) synchronous op on the whole graph)
- without creating N more processes/subsystems
  - meaning that you can partition off some part of the system
- requires you to decide what you can & can't know about things in & out
- also requires you decide what you mean by “watch” watch versus watch deep

## Watch and Notify

“The literature” on dataflow (okay one paper) talks about *signals* (which are
like subscribables), which are classed into *events* and *reactive variables*.

These things seem to correspond to the “watch” and “notify” mixins in
`@thi.ng/api`.  Notify is for events.  Watch is for reactive variables.
Subscribable as a mechanism is perfectly fine for both.  (`Watch` messages in
`thi.ng` include a slot for old value and new value, which doesn't make sense
for a reactive variable.  But if you create a stream from a watch, it only
includes the updated value (I think).)

Is that right?

> A special type of signals are *reactive variables*, which act as a *signal
> source* as they are the only signals not implicitly updated by their
> dependencies but manually set by the user.

What is defined here a “signal source” is what I would call an “ingress,” that
is, something whose inputs lie outside of the system.

A node based on a formula would not qualify as a “reactive variable” by this
definition, though I would be inclined to call them such.

The idea that events, unlike other signals, “do not have a persistent value” is
consistent with how I see the difference between an event emitter (notifier) and
a watcher.  But this difference seems to be about interpretation, or some
higher-level semantic than the mechanism, which is common to both.





## Watching systems of things

watchdeep presupposes either a tree or some way to identify entities

“deep” is at the other extreme

how do you specify how much you want to watch if it's not everything?

is this really something you want to be asking?

and isn't it more a problem of the consumer than of the interface?

i.e. isn't the individual thing still only responsible for watching itself?

sounds good -- but doesn't that then mean that you have to make N watches
(and thus N subprocesses) for N things?  and is there any way around that?

so the big thing is just being able to identify things consistently

## Multiple watches (of Atom)

If a thing has a dynamic value as one of its properties, does that mean that the
property is a separate thing?

No, the watcher of that property is a separate thing.  You can put multiple
watches, even on the same property using thi.ng/Atom.

Are those processes contingent?  Was the Atom a process in the first place?
