# MELD CLI

This packages provides a command-line entrypoint for creating a MELD system.

I don't know that a separate package is really warranted, but for the moment it
makes my iterations more convenient.

Either way, this package should not export anything.  It always runs its main.

The considerations here are specific to MELD in a POSIX-style system, and in
some cases specific to Node and JavaScript.  Many of these considerations do not
have direct equivalents in a browser environment.

## Considerations

Consider a live system.

Think of what you get with a REPL.  You get some kind of *sink*, usually a way
to submit code, along with a *display*, usually the result of evaluating the
code you submitted.  You also get a persistent *state*: things you define and
even processes that you run remain alive “inside” the system.

In other words, you get an *interaction machine*.

It's also possible for multiple clients to connect to the same system.

It would also be possible for each of multiple clients to have a *session*: some
isolated state of its own.

In other words, you get a *server*.

## Process

In OS terms, you get a *process*.

An OS process is the “world” in which a MELD system lives, a.k.a. “userland.”

OS processes are not to be confused with userland processes, which we'll define.

The two are mutually exclusive by definition.

## Invariants

When we start this process, it's intended to live for a long time.

There are a few main reasons why we would consider some aspects of the system as
not subject to change:

- it would violate our *platform constraints*: the changes are not technically
  feasible in a running process in the given execution environment.
  
- it would violate our *design invariants*: such changes would conflict with the
  baseline guarantees that we want the system to make.
  
- it would violate our *users' intent*: the person who launched the process
  expressed that the system should enforce certain restrictions.

## Fixed intent

There are two main ways that users can communicate information that is invariant
throughout the process's lifetime:

1. command-line arguments

2. environment settings

Let's think of these as messages.

The OS provides these to the process once at the time it is created.

Once a process has started, the user *cannot change* these messages.

There are thus two main reasons for using these messages:

- to tell how a system should *start*

- to tell how a system should *remain*

The first of these is merely a convenience.  Any state that the system could
adopt at startup could as well be adopter later using some other means of
communication.

So we will tend to prefer the interpretation of these process-level messages as
communicating an intended invariant.

### Configuration

One other way that users might communicate intentions about invariants is
through configuration files, such as a `~/.meldrc` file (shudder).  Such files
may be a more convenient way of providing structured data than the others.  If
we were going to have such a thing, I would expect it to be in Turtle.

## Communication

- stdin/stdout/stderr

- sockets (unix/network)

- special Node IPC

## Defaults

This leaves open many questions about how we would interpret startup arguments.

What would we expect to happen when we *don't* provide any arguments?

The one thing that we *don't* want is for the system to become invisible, or
undiscoverable.

We can open a browser, but what if the user closes it?

We can run in the foreground, but what if the user launches as a background job?

How do you “get it back” in these situations?

We could play some ambient sound indicating that the process is alive.
