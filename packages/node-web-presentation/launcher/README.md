# Node launcher CLI

See notes in main README.

## Thoughts dump

- okay so suppose we load this program every time
- do we really want to run the whole thing every time?
  
- idea is that, among other things, we can watch the global namespace
- programmer can create things
- things will persist through change to the code
  
- so what is the code for?
- create *bindings*, not just instructions
- nice, but js doesn't work that way
- when you've modified the program, you have to run it again
- you have no way to know whether a certain statement is intended to be re-executed
- so you have to provide tools for making *expressions* rather than commands
- you can do that
- but you don't *have* to do that for this to work
- if you re-evaluate the whole program again every time, it's not much like a repl...
- yet it was good enough for play modes.  and you can use `state` as before
- you need to provide tools to avoid recalculation
- it's not meant to support arbitrary javascript
  
- would it be more like, you run this on a *directory*?
- maybe, but also has to work for an individual file

### Examples

#### Word list
  
- let's say we want to load a bunch of data
- like, all the words in a word list
- then we want to make a prefix trie from it
- which in turn will be used to compute solutions against a puzzle
- or used to drive an autocomplete

#### XML transforms
  
- or let's say we're looking at some XML (yes XML) data
- and we want to see the result of a transform on it
- and we're working on the transform

#### CSV transforms
  
- or let's say we're looking at a CSV file representing a variable metadata list
- and we want to restructure it in various ways

#### View global namespace

- but first, we just need a way to look at the runtime itself
- all these things will be in the runtime somewhere
- to be discoverable, they must be on the global namespace
