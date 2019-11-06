# General notes about modeling (esp JS) things for MELD interop

Where MELD interop means that we have a story on all the goods (visible, etc).

This design dynamic is pulled in two main directions:
- on one hand, providing abstractions that help reach higher-level concerns
  calls for conformance to (new) interfaces
- on the other hand, existing mechanisms that were not designed with those
  interfaces in mind should not necessarily be completely unusable just because
  they may not support all adapters in their current forms

## Example: subprocesses

By “processes” here we mean *userland* processes.

By “process” here we mean a related sequence of invocations over time.

An ingress is a related source of invocations from non-userland code.

In an ideal world, “the system” can track all processes in a given runtime.

Processes have effects.  Some effects are directly visible; some aren't.

It's critical that all processes be *knowable* by the system.

For such a thing to be possible, you need to maintain the invariant at least one
of the following is true of all processes:
1. the system itself creates them
2. the system is notified of their creation
3. the system can discover them retroactively through a well-defined traversal

These levels of integration may suit different situations.  All of them meet the
essential requirement, and there does not currently appear to be a need to
expect that all implementations will eventually work their way up to the first
one (which requires direct contact with the system by either the mechanism or an
adapter).

## Crimes

Now, consider what a system would look like that did not satisfy *any* of these
invariants.

This function has a side effect.  It unconditionally prints to the console,
using my favorite globally-available API to hate.

```
function synchronous_side_effect() {
  console.log("I just executed!  Who am I?  Wouldn't you like to know!")
}
```

If a synchronous side effect is a misdemeanor, an asynchronous one is a felony.

```
function side_effect_later() {
  setTimeout(() => {
    console.log("You called?  Who are you?  Wouldn't I like to know!")
  }, 1000)
}
```

Serial murder:

```
function side_effects_forever() {
  setTimeout(() => {
    console.log("You can't stop me without taking down the whole system, man.")
  }, 1000)
}
```

The bad new is that most code works this way.

The good news is that this is fundamentally about as bad as it gets.

Or is it?  What about a function that wants to create other processes that
create other processes?

```
function spawn_another() {
  setTimeout(spawn_another, 1000)
}
```

This process doesn't have any visible side-effect, yet it will continue to be an
invocation site forever.

So there would be no particular reason to do this.  But you can imagine a slight
variation.

```
function spawn_another() {
  setTimeout(spawn_another, 1000)
}
```


If we could find a wholesome way for code to address these basic cases.

Note that none of these functions take arguments.

While we would of course need to consider functions that take arguments, it is
not in fact the providing of arguments that fundamentally changes the ability to
manage the use of these functions.  It's the providing of *references* as
arguments.  Clearly, providing arguments to functions that are not themselves
well-behaved would make it impossible to assert the good behavior of the
receiving function.  So we will assume that arguments to functions are well
behaved.

Finally, the return value of these functions can be an object that acts as the
locus of state and more functions.  This is pretty much how JavaScript works, so
we won't fight it.  We'll call the result a “thing.”

## Redemption

What's a poor function to do?  I mean, you have to do *something*, sooner or
later!  (And sometimes both.)

The problem is not that things happen (side effects and scheduling).

### from making a mess

Here is a function that provides a cleanup method as its return value.

```
function interval_with_cleanup() {
  const interval = setInterval(
    () => console.log("You can stop me!"),
    1000
  );
  return () => clearInterval(interval);
}
```

This is *almost* how streams work (see below).

The “mess” in question is the existence of an untraceable entity.  It's the kind
of thing that we don't want to “escape,” yet we also don't want references to
the “thing itself” to escape.  What we want is to put it in the knowledge base
so the system can provide interop with it as needed.  That interop must be
governed by the system's rules.  And that's how all this works.

### from arbitrary side-effects

To invert control and allow the caller to decide what (if anything) happens upon
invocation, you can return an entity that provides a subscribable.

```
function interval_stream_source(ms) {
  let counter = 0;
  return sub => {
    const interval = setInterval(
      () => sub.next(counter++),
      ms
    );
    return () => clearInterval(interval);
  }
}
```

And *this* is how Stream works.

### from making more things

Let's say that the above example “is the thing” that represents the interval.
It can be responsible for cleaning up its own resource(s), which are thus not
separate entities from the system's viewpoint.

But what if a thing wants to make more than one thing?

```
function parent_of_many_things() {
  const thing_one = interval_stream_source(100);
  const thing_two = interval_stream_source(200);
  return () => {
    thing_one();
	thing_two();
  }
}
```

This parent acts responsibly by providing a cleanup method that terminates its
children when invoked.

But it is *irresponsible* in several other ways.
- it doesn't tell the system when it creates those things
- the things thus created are only available as references (not descriptions)
- it can't answer what things it has
- it doesn't identify those things with data (only with opaque internal labels)

## Inspectable

For a thing to be *inspectable*, it must provide a way to traverse its parts.

## Questions

### Is scheduling a kind of side effect?
### Is a port collection a kind of process tree node?

If the port collection isn't going to change, then you don't need the extra
machinery of events related to the child definitions.

But of course, is there any value in asserting that those things *aren't* going
to change?  You never really know that.

## Contingent processes

We consider one process *contingent* on another if it cannot live without that
process and will thus die on its termination.

We can *reflect* the fact that, according to information reported by a pair of
processes, one of them (A) is contingent on the other (B).  We would expect to
see this fact borne out by reality: if B dies, then so does A.

We can also *assert* that one process is contingent on another, in which case it
becomes the responsibility of an outside entity to reify this assertion by
killing A when B dies.

This is not the same as a parent-child relationship among processes because it
is possible for a process to be orphaned (its parent dies but it remains alive).

How is this different than a process being *dependent* on another?  It's close.
But “dependent” suggests that the one receives some kind of continual or regular
succor from the other.  A process can be *independent* during its lifetime while
its lifetime is yet contingent on the existence of the other process.

*Coterminal* might be a more precise term in that regard.  However, this term
doesn't carry directionality.  One process being “coterminal” with another
suggests that the death of either one implies the death of the other.  This is
not the case for a contingent process, which may die without affecting the
process on which it is contingent.

*Predicated* might be an alternative term.  It does somewhat suggest more of a
truth-value dependency, versus a dependency on existence.
