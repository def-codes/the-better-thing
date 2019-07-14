const SPACE_COMMON = `space.isa.Forcefield,
space.hasForce.center,
space.hasForce.charge,
center.isa.forceCenter,
charge.isa.forceManyBody,
charge.strength(-200),
charge.distanceMax(250),
charge.theta(0.98),
`;

export const MIND_MAP = {
  "@context": {
    rdf: "http://w3....rdf/syntax",
    skos: "http://skos....",
    id: "{type: @id}", // redundant?
    ex: "http://example.com",
    label: "rdf:label",
    comment: "skos:comment",
    task: "ex:task",
    seeAlso: "rdf:seeAlso",
  },
  "@graph": [
    {
      id: "bastille-day-punch-list",
      label: "Bastille day punch list",
    },
    {
      id: "ReificationPunchList",
      comment: `Clearinghouse for items needing refication.  But see #ZeroEdits.  We need to
meet existing resource descriptions where they are.  So this may be equivalent
to a #DataficationSpree.`,
    },
    {
      id: "Naming",
      comment: [
        `The other hard thing.`,
        `but deeper, hashtag and at.  How should we leverage those sigils, and how does
this relate to naming conventions?


 (which effectively *is* true of
URL's and email addresses).


`,
      ],
    },
    {
      id: "isCaseSensitive",
      subtitle: `in which I make arguments for and against case-sensitivity`,
      comment: `All of the portable reference formats have been effectively case-insensitive.
URL's, email addresses, and now hashtags and @'s.
  
? hashtags are case-insensitive? (or does the app normalize them)
? at's are case-insensitive? (or does the app normalize them)

Those pieces of text would be more difficult to use if you had to match the
capitalization of each letter exactly.  Yet, as with phone numbers, we seldom
type them directly.  Rather, we normally summon them from our history of prior
activity, which remains a strong indicator of imminent interest.


RDF terms are case-sensitive.  This is a feature of RDF.  It is a bug of
programming-by-character sequence that we should consider this difference for
even a moment, in favor of case-insensitivity.

(case of hashtags and at's undetermined)


`,
      seeAlso:
        "https://blog.apastyle.org/apastyle/2015/02/how-to-cite-a-hashtag-in-apa-style.html",
    },
    {
      id: "DatafyJSONLD",
      comment: ``,
    },
    {
      id: "ReifyMindMap",
      comment: `Really means support graph traversal of JSON-LD-like objects.  They are already
datafied as such, but they cannot traverse “upward” without a graph context.
This is the same point as about `,
      status: "TODO",
      partOf: "reification-spree",
    },
    {
      id: "Programming",
      comment: `You're already doing it.  Texting and emailing are nothing but processes of
discrete symbolic operations.  To say nothing of other programming habits.`,
    },
    {
      id: "MachineInterface",
      comment: `Should precede the HumanInterface`,
    },
    {
      id: "ZeroEdits",
      comment: `
Descriptions of/Datafied Things already exist in various forms (markdown, html,
json-ld, javascript modules, triples, userland code, triples in javascript
form, JSDoc comments, which include metadata and markdown).  Rather than
reformulating those things, why not just datafy them?

Then content-editable HTML is another way of writing linked data.  (Well, you
need a way to hyperlink.  But one thing at a time.)

JSON-LD espouses the notion of “zero edits”, a design principle that favors what
might also be called “hands free” protocols, where a direct handshake with the
extendee need not occur.

A “zero-edits” approach to linked-datafication requires support for remote
protocol extension.

Host reflection makes both kinds of extension (hard or soft reference) possible.
`,
    },
    {
      id: "replace-mind-map-display-with-polymorphic-render",
      label: "Replace mind map display with polymorphic render",
      comment: `This does *not* require you to bring the JSON into a graph: you should be able
to traverse it as-is.  Is that right?  Not so sure.  If you're given the whole
thing, then you can use JSON-LD algorithm to make triples out of it.  But if you
descend into it (as in a navigation context), won't you lose the context needed
to follow node references?  What do you mean by “follow node references”?  If
you emit links for terms, then *navigating* to those things happens out-of-band.
But following them down for the sake of showing more details.`,
      status: "IN-PROGRESS",
      partOf: "bastille-day-punch-list",
    },
    {
      id: "make-markdown-showable",
      label: "make markdown showable",
      comment: `Use the @thi.ng/hiccup-markdown`,
      status: "TODO",
      partOf: "bastille-day-punch-list",
    },
    {
      id: "ReifyDrivers",
      partOf: "reification-spree",
    },
    {
      id: "ReifyDriverRules",
      partOf: "reification-spree",
    },
    {
      id: "ReifyExpressions",
      partOf: "reification-spree",
    },
    {
      id: "Expression",
      comment: `A structured form.`,
    },
    {
      id: "reification",
      label: "reification",
      comment: `To “reify” is to “make real”.  To make a real computing envirionment, we must
reify all the things.`,
    },
    {
      id: "Hashtags",
      comment: `Hashtags are a way of writing identifiers.

In HTML, hashtags are used for local names.  \`#plan\` refers to the element in the 
current document with \`"id"="plan"\`.

Twitter notwithstanding, no W3 specification attributes global meaning to hashtags.


## #Hashtag re #ZeroEdits

It matters that people already use these conventions.



## Sigils - punctuation syntax

Aside from the fact that it's already in common usage, it's also arguably
easier to hashtagize something than to .

Because a sigil is more ergonomical to type than an enclosing
symbol-pair.

That said, it doesn't *need* to be syntically convenient as long as it's
structurally clear.  We can't *type* our way out of this.

Another conside

In any event, we will use something more like \`hashtag(Alice)\` as a macro 
command because it doesn't require special knowledge of the symbol
and is backward-compatible with with how people already pronounce those 
expressions.


## Impedance mismatch: RDF vs # and @

In practice, many RDF vocabularies use hashtags to demark the local part of 
individual terms.

A resource name is a global identifier, but for convenience we can use the local
part independently when in the context of that namespace.

A contruct that you could call a “hashtag” is thus a shorthand for a 
globally-unambiguous thing, and this connection is made by way of
an officially-recommended syntax.

Resources can be anything: a concept, a collection of things, a person.
But people are distinguished as a class, and a second sigil is reserved 
for their identifiers: \`@\`.



`,
    },
    {
      id: "Interpreter",
      comment: `
- Q: Where do interpreters come from?
- A: Descriptions, reified by interpreter driver.

- Q: Is an interpreter a process?
- A: possibly

- Q: Can an interpreter *not* be a process?
- A: possibly... interpretation rules *may* be expressible as pure functions

- Q: Is it necessary to distinguish interpreter as a process subclass?
- A: not that I can see

- Q: Do all process (coordination) models use some kind of message passing?
- A: It seems to me

- Q: Is datafy an interpretation?
- A: No, datafy is a implicit prerequisite for interpretation.

- Q: Does an interpreter live in the context of a single named graph?
- A: for now, yes

- Q: What is an interpreter interpreting?
- A: A claim space.

- Q: Can you not interpret a value space?
- A: Not as such, though you can create claims that reference them.

- Q: Isn't representation an interpretation of a value?
- A: Not exactly.  A representation is an interpretation of claims about a value.

- Q: Values are transparent.  How can claims about them be in dispute?
- A: Are resources not transparent?



`,
    },
    {
      id: "Processify",
      comment: "To interpret as a process",
    },

    {
      id: "Process",
      comment: `What would Process protocol look like?  How can you *tell* it's a process?
By sending it a message that only a process would understand.
`,
    },
    {
      id: "Actor",
      comment: `Actor is a metaphor that's been used as a primitive for process modeling [Hewitt].`,
    },
    {
      id: "Wiki",
      comment: `Wiki has introduced some now-well-understood semantics into the mainstream
conception of knowledge representation.

Everybody gets a wiki.  MELD is a traveling wiki.  YOUR traveling wiki.  It's an
immutable data structure.  It cannot destroy itself.  Only the user can destroy
it.

So yes, adopting the semantics of a wiki, would be well-suited to a default MELD
interface, since the underlying data is a collection of interlinked articles.
`,
    },
    {
      status: "TODO",
    },
    {
      id: "navigation",
      "@type": "topic",
      label: "Navigation",
      comment: `People navigate Spaces, Spaces areNavigatedBy, the Act of Navigation.`,
      userland_code: `
// Alice.hostInput("visits")
// vv(viewOf.Alice, viewIn.home)
// navigation... is an interpretation of the event of an address change

// that is, the address moves before the thing.  The address is just a signal. of intent.
//
// we don't know whether a program or the user triggered the address change
// if we refrain from changing the address programmatically, then we can assume navigation is from the user.
// we can also still intercept link click events, if you want to be stricter about tracking that
//
// anyway, do visitation first.
`,
    },

    {
      id: "visitation",
      label: "Visitation",
      comment: `People visit Places, Resources areVisitedBy, the Act of Visitation.`,
      userland_code: `
Alice.hostInput("visits")

vv(viewOf.Alice, viewIn.home)
`,
    },
    // vv a Stream (implied)
    // a stream of hashtags.  hashtags are first-class web.  always have been
    //
    {
      id: "host-input",
      label: "host input",
      comment: `Input ports provide a way for outside parties to send messages to the model.`,
      userland_code: `
Alice.hostInput("test")
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "shows",
      label:
        "a selection can say “shows” to specify a property that its representation should contain",
      comment: `?`,
      userland_code: `

// but shouldn't representations show their properties by default anyway?

Alice.hasSource(sub => sub.next({name: John, age: 38}))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "wraps",
      label:
        "The box representing a selection can be “wrapped” by a given template.",
      comment: `?`,
      userland_code: `

SelectionIndicator.wraps.Selection
//  or
SelectionIndicator.wraps(a.Selection)

SelectionIndicator = content => ["div.SelectionIndicator", content]

wraps.inverseOf.wrappedBy

Alice.hasSource(sub => sub.next({name: John, age: 38}))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "term-view",
      label: "Representation of (RDF) terms",
      comment: `?`,
      userland_code: `

// term should indicate term type (named node, blank node) in metadata (attribute)

// named nodes should link to their IRI (with caveats)
// named nodes should use active prefixes when applicable (TBD)

// variable nodes should appear with question marks (as placeholders)

// blank nodes should appear as anonymous terms... (avoid showing node id)

// literals should appear as values

// triples (separate topic) should appear as s -> p -> o


Alice.hasSource(sub => sub.next(John))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "set-view",
      label: "set view",
      comment: `?`,
      userland_code: `


// set should show item count
// set should show some members
// set should fit to container
// set should indicate that it's a set even when it's empty
// set should indicate that it's a set even when it has no room to show members
// set should not show in excess of 50 members






Alice.hasSource(sub => sub.next(new Set([
"Harpo", "Groucho", "Zeppo", "Karl"
])))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "dictionary-view",
      label: "dictionary view",
      comment: `?`,
      userland_code: `


// dictionary should show item count
// dictionary should show some key-value pairs
// dictionary should fit to container
// dictionary key-value pairs should have arrow pointing from key to value
// dictionary should not show in excess of 50 key-value pairs
// dictionary should indicate that it's a dictionary even when it's empty
// dictionary should indicate that it's a dictionary even when it has no room to show members






Alice.hasSource(sub => sub.next({
  friend: "foe",
  up: "down",
  left: "right",
  top: "bottom",
  sinister: "dexter",
  maybe: "maybe not",
  adult: "child",
  happy: "sad"
}))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "vector-view",
      label: "vector view",
      comment: `?`,
      userland_code: `


// vector should show item count
// vector should fit to container
// vector should not show in excess of 50 items
// vector should indicate that it's a vector even when it's empty
// vector should indicate that it's a vector even when it has no room to show members






Alice.hasSource(sub => sub.next(["once", "twice", "three times", "a lady"]))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "special-view-2",
      label: "special view 2",
      comment: `?`,
      userland_code: `

isa.Circle
isa.Square
isa.Triangle
isa.Star
// or just funny unicode points

Alice.hasSource(sub => [Circle, Square, Triangle, Star].forEach(value => sub.next(value)))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "special-view-1",
      label: "special view 1",
      comment: `?`,
      userland_code: `

// To select all of the roles:
// pluck role
// flatten
// distinct
// Is this a presentation matter?










Alice.hasSource(sub => sub.next([
  { id: "John", role: ["guitar", "vocals"], age: 20 },
  { id: "Paul", role: ["bass", "guitar", "vocals"], age: 21 },
  { id: "George", role: ["guitar", "vocals"], age: 22 },
  { id: "Ringo", role: ["drums"], age: 19 },
]))
vv(viewOf.Alice, viewIn.home)
`,
    },

    {
      id: "view-specialization",
      label: "view specialization",
      comment: `How do you make simple statements that specialize the appearance of a type of thing?`,
      userland_code: `// Not about resources, though, about values, right?

Alice.hasInterval(1000)
Bob.listensTo.Alice
Bob.transformsWith(mapsWith(x => ["details", {}, ["summary", {}, ["b", {}, "the state of Alice"]], ["p", {}, x, " ticks"]]))
Carol.listensTo.Bob
Carol.transformsWith(hasRoot.home)

// The in-progress task is at the top, at the forefront, most prominent
// A passing test shows JUST a green (success/okay) light and the name
//  Details of a passing test are rendered but hidden
// A failing test shows a red (failure/attention) indicator
//    and the name

//  if something is selected, then it has an indicator encompassing it
// ?subject.isa.Selected => 


// details (markup)
// size (width, height)
// translucency (opacity)
// isolation (margins)
// color (background)
// floating (box-shadow)
// orientation (transform)

`,
    },

    {
      id: "function-testing",
      label: "function testing",
      comment: `Bootstrapping.  We write a lot of functions. And hand-written test cases.  Let's
run them here and see the results.`,
      userland_code: `Alice.moduleAt("./node_modules/@def.codes/rdf-expressions-test.js")
Bob(listensTo.Alice, transformsWith(plucks("TEST_CASES")))
Carol(listensTo.Bob, transformsWith(mapsValuesWithResource(RunTest)))
home.contains.CarolHome
vc(viewOf.Carol, viewIn.CarolHome)

`,
    },

    {
      id: "module",
      label: "ECMAScript modules",
      comment: `Loading JS modules is not the same as loading other resources.  For one thing,
module code is executed on load.  For another, they usually export mechanisms
rather than values.  So this is probably not good for userland.`,
      userland_code: `// MELD terms are not yet true IRI's.
// Relative paths shouldn't really be used.  This is just for local development.
Alice.moduleAt("./node_modules/@def.codes/meld-demo.js")
// Alice.hostOutput("Alice")
Bob(listensTo.Alice, transformsWith(mapsWith(x => x.MELD_EXAMPLES)))
Bob.hostOutput("Bob")

`,
    },
    {
      id: "http",
      label: "HTTP resources",
      comment: `RDF terms are already (supposed to be) IRI's.  Getting the content at that address is called “dereferencing.”`,
      userland_code: `// MELD terms are not yet true IRI's.
Alice.dereferences("./dereference-example.json")
Alice.hostOutput("Alice")
`,
    },
    {
      id: "multiple-rules-bug",
      label: "BUG with multiple there-exists rules",
      comment: `Repro case for an apparent bug with construction of there-exists assertions`,
      userland_code: `home.contains.more
Alice(hasInterval(150))
vv(viewOf.Alice, viewIn.more)

Bob(
  listensTo.Alice,
  transformsWith(partitionsWith({size:5, step: 1})))
home.contains.BobHome
BobView(viewOf.Bob, viewIn.BobHome)

// Carol shows as having the same spec as Bob (5, 1)
// but works correctly (9, 3) if you comment Bob
Carol(
  listensTo.Alice,
  transformsWith(partitionsWith({size:9, step: 3})))
home.contains.CarolHome
CarolView(viewOf.Carol, viewIn.CarolHome)
`,
    },

    {
      id: "there-exists",
      label: "there exists",
      comment: `Rules that assert the existence of a dynamic set of facts.  Right now this is implicitly tested by rules in the test driver.`,
      userland_code: `
Alice.hasInterval(100)
Bob(listensTo(Alice))
v.viewOf.Bob
// there exists
`,
    },

    {
      id: "dataflow-repeat-values-bug",
      label: "repeating values bug",
      comment:
        "This was a repro case for a bug in dataflow, which is fixed now.",
      userland_code: `Alice . hostOutput("Alice")
Bob . hostOutput("Bob")

Alice . hasInterval(300)

Bob(listensTo.Alice, transformsWith(partitionsBy(5)))

// ListenerForv.listensTo.Bob
// ListenerForv.transformsWith.MapperForv
// MapperForv.mapsWith(x => ["b", {}, x.toString()])
// Listener2Forv.listensTo.ListenerForv
// Listener2Forv.transformsWith.HdomForv
// HdomForv.hasRoot.home

// This expands something very close to the above
v(viewOf.Bob, viewIn.home)

`,
    },

    {
      id: "views",
      label: "views",
      comment: "WIP approach to views",
      userland_code: `Alice(hasInterval(100), hostOutput("Alice"))
Bob(listensTo.Alice, hostOutput("Bob"))

// model.contains.v

v(viewOf.Bob, viewIn.home)

Carol(listensTo.Bob, 
  transformsWith(mapsWith(c => c)), 
  hostOutput("Carol"))

foo(
  listensTo.ListenerForv,
  transformsWith(hasRoot.home))

//ListenerForv.hostOutput("lv")

`,
    },
    {
      id: "subgraph-view",
      label: "subgraph view",
      comment: "Subgraphs.",
      userland_code: `Alice . hostOutput("Alice")
Alice . isa . AllFacts

`,
    },

    {
      id: "hdom",
      label: "primitive hdom",
      comment:
        "@thi.ng/hdom transducer can be bound to a DOM node to keep DOM synced with a template.",
      userland_code: `Alice . hostOutput("Alice")
Bob . hostOutput("Bob")

Alice . hasInterval(100)

Bob(listensTo.Alice, transformsWith(hasRoot.home))

// Alice . knows . Bob
// X.contains.Y
// P.isa.Circle
// Q.isa.Square
`,
    },

    {
      id: "hdom-template",
      label: "hdom with template",
      comment: "Typically, an hdom node is preceded by a mapping transform.",
      userland_code: `Alice . hostOutput("Alice")
Carol.hostOutput("Carol")
Bob . hostOutput("Bob")
Joan . hostOutput("Joan")

Alice . hasInterval(100)

Carol(
  listensTo.Joan,
  transformsWith(mapsWith(n  => ["p", {}, '#', n ])))

Joan(
  listensTo.Alice,
  transformsWith(mapsWith(x => x % 2)))

Bob(
  listensTo.Carol,
  transformsWith(hasRoot.home))
`,
    },

    {
      id: "host",
      label: "host interop (dataflow output)",
      comment: `A model needs a host in order to function.  Since an empty model can't do anything—not even display its own contents!—we'll need help from the host in order to get this thing off the ground.`,
      userland_code: `Alice . hasInterval(100)
Alice . hostOutput("Alice")

// Uncomment to add a port for bob
// Bob(hasInterval(250), hostOutput("Robert"))

`,
    },

    {
      id: "streams-order-bug",
      label: "BUG repro case for stream subscription",
      comment: `Order in the statement of facts is not supposed to matter, at least not in the initial batch of a model's persisted facts.  But with synchronous stream subscriptions, order does matter.`,
      userland_code: `
stream . hasSource(sub => { sub.next("hello"); sub.next("world"); })

// see below
//someone_else. listensTo.stream

someone . listensTo . stream
someone . hostOutput("someone")

// This issues "hello" and then "world" in immediate succession.  To see both
// values, you'd have to e.g. partition it.

// If you move this 'listensTo' before the previous 'listensTo', then you see
// both outputs.  That's because the stream is synchronously consumed once its
// first listener is attached.
someone_else. listensTo.stream
someone_else. transformsWith(partitionsBy(2))
someone_else. hostOutput("both")

`,
    },

    // Which of these examples should come first?
    // without subscription, how do you see the results?
    // without stream, how do you get a dataful source to subscribe to?
    {
      id: "streams",
      label: "streams driver",
      comment: `testing reified streams`,
      userland_code: `
// stream . isa . Stream // (implicit)
// stream . hasSource("brother") // will be ignored with warning
stream . hasSource(sub => { sub.next("hello"); sub.next("world"); })

// Streams don't do anything until they have a listener.
someone . listensTo . stream
someone . hostOutput("someone")

// This issues "hello" and then "world" in immediate succession.  To see both
// values, you'd have to e.g. partition it.
someone_else(
  listensTo.stream, 
  transformsWith(partitionsBy(2)),
  hostOutput("both"))
`,
    },

    {
      id: "ticker",
      label: "tikers",
      comment: `A ticker is a stream that counts over a specified time interval.`,
      userland_code: `Alice . hasInterval(1000)
Bob . hasInterval(250)
`,
    },

    {
      id: "subscription",
      label: "subscription driver (verbose)",
      comment: `in which Alice and Bob listen to one another`,
      userland_code: `// Display
Alice.hostOutput("Alice")
Carol(hasInterval(200), hostOutput("Carol"))

Alice . listensTo . Carol
//Alice . listensTo . Joan

`,
    },

    {
      id: "subscription-chain",
      label: "subscription chain (transitive listening)",
      comment: `a game of telephone`,
      userland_code: `// Display
Alice(hasInterval(200), hostOutput("Alice"))
Bob(listensTo . Alice, hostOutput("Bob"))
Carol(listensTo . Bob, hostOutput("Carol"))

`,
    },

    {
      id: "subscription-broadcast",
      label: "subscription broadcast (multiple listeners)",
      comment: `Alice speaks directly to everyone`,
      userland_code: `// Display
Alice.hostOutput("Alice")
Bob.hostOutput("Bob")
Carol.hostOutput("Carol")

Alice.hasInterval(200)
Bob . listensTo . Alice
Carol . listensTo . Alice

`,
    },

    {
      id: "stream-merge",
      label: "merging streams",
      comment: `in which Alice listens to two people at once`,
      userland_code: `// Display
Alice.hostOutput("Alice"),
Carol.hostOutput("Carol")
Joan.hostOutput("Joan")

Carol.hasInterval(200)

Alice . listensTo . Carol

Joan.hasInterval(500)

// Uncomment to see Alice merging Carol & Joan's output
//Alice . listensTo . Joan

`,
    },

    {
      id: "subscription-simple",
      label: "subscription driver",
      comment: `in which Alice and Bob listen to one another`,
      userland_code: `
Alice . listensTo . Bob
Bob . listensTo . Carol
Carol . hasInterval(10)

`,
    },

    {
      id: "transducers",
      label: "transducers",
      comment: `Transducers are algorithmic stream transformations`,
      userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)

Bob.listensTo.Alice
Bob.transformsWith(mapsWith(x => x * 2)))

`,
    },

    {
      id: "mapping-transducers",
      label: "mapping transducers",
      comment: `Mapping transducers apply a transformation to every value in an input stream.`,
      userland_code: `
Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . mapper
mapper . mapsWith(x => x * 2)

`,
    },

    {
      id: "filtering-transducers",
      label: "filtering transducers",
      comment: `Filtering conditionally includes values from an input stream.`,
      userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . odd
odd . filtersWith(x => x % 2 == 1)

`,
    },

    {
      id: "partitioning-transducers",
      label: "partitioning transducers",
      comment: `Partitioning batches an output stream by some size.`,
      userland_code: `Alice.hostOutput("Alice")
Bob.hostOutput("Bob")

Alice . hasInterval(250)
Bob . listensTo . Alice

Bob . transformsWith . batchesOfThree
batchesOfThree . partitionsBy(3)

Carol(
  listensTo.Bob,
  transformsWith(mapsWith(batch => ({batch}))),
  hostOutput("Carol"))
 `,
    },

    {
      id: "partition-step",
      label: "partitioning with size and step",
      comment: `you can set the offset as well as the window size`,
      userland_code: `home.contains.more
Alice(hasInterval(150))
vv(viewOf.Alice, viewIn.more)

Bob(
  listensTo.Alice,
  transformsWith(partitionsWith({size:5, step: 1})))
home.contains.BobHome
BobView(viewOf.Bob, viewIn.BobHome)

Carol(
  listensTo.Alice,
  transformsWith(partitionsWith({size:9, step: 3})))
home.contains.CarolHome
CarolView(viewOf.Carol, viewIn.CarolHome)
`,
    },

    {
      id: "plucking-transducer",
      label: "plucking",
      comment: `A plucking transformer extracts part of the incoming value by key`,
      userland_code: `home.contains.more
Alice(hasInterval(150))
vv(viewOf.Alice, viewIn.more)

Bob(
  listensTo.Alice,
  transformsWith(mapsWith(x => ({ name: \`Agent \${x}\`, double: x *2 }))))
home.contains.BobHome
BobView(viewOf.Bob, viewIn.BobHome)

Carol(
  listensTo.Bob,
  transformsWith(plucks("name")))
home.contains.CarolHome
CarolView(viewOf.Carol, viewIn.CarolHome)
`,
    },

    {
      id: "sparql-where",
      label: "SPARQL WHERE",
      comment: `SPARQL queries support a WHERE clause for describing the subgraphs you're interested in.`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

// A standalone WHERE doesn't do anything...  right?
WHERE(Alice.knows.$someone)
// results [{someone: Bob}, {someone: Carol}]

// Note this “someone” is independent of the above
WHERE($anyone.knows.$someone)
// results [{anyone: Alice, someone: Bob}... etc

// Clauses are conjunctive (and-ed)
WHERE(Alice.knows.$someone, Carol.knows.$someone)
// results [{someone: Bob}]

// No results
WHERE(Alice.knows.$someone, Bob.knows.$someone)
// results []

`,
    },

    {
      id: "sparql-select",
      label: "SPARQL SELECT",
      comment: `SELECT is one of the four ways to request results from a SPARQL query.  For each
time that the pattern matched in the graph, creates a “record,” which is a
dictionary containing the matched value for the defined variables.`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

SELECT($someone)
.WHERE($someone.knows.Alice)

SELECT($someone, $anyone)
.WHERE($someone.knows.$anyone)

`,
    },

    {
      id: "sparql-construct",
      label: "SPARQL CONSTRUCT",
      comment: `A CONSTRUCT clause allows you to describe a (new) graph based on a SPARQL query
result set.  A CONSTRUCT clause is itself a graph template.  For each result,
the template is filled out with any variables.  May also include “ground”
triples, i.e. those without variables.`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

WHERE($someone.knows.$anyone)
.CONSTRUCT(
  $someone.shouldVisit.$anyone, 
  $anyone.shouldVisit.$someone
)

`,
    },

    {
      id: "sparql-describe",
      label: "SPARQL DESCRIBE",
      comment: `DESCRIBE means “give me information about these resources” from the matched set.
What information to include is up to the implementation.  I'll have more to say
about that anon.`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Carol . knows . Bob

WHERE($someone.isa.Person)
.DESCRIBE($someone)

`,
    },

    {
      id: "traversal",
      label: "traversal driver",
      comment: `testing reified traversal`,
      userland_code: `Alice . knows . Bob
Bob . knows . Carol
// We would expect this traversal to include the above two facts
t . isa . XTraversal
t . startsFrom . Alice

x . hasClause . c
c . hasSubject . $knower
c . hasPredicate . knows
c . hasObject . $knowee

t2 . isa . Traversal
t2 . startsFrom .x

`,
    },
    {
      id: "Compositionality",
      comment: `A word that Stu Halloway said publicly.`,
    },
    {
      id: `OpenWorld`,
      seeAlso: "Compositionality",
      comment: `Compositional algebras avoid inherent conflict.

For example, \`comment\` is more #compositional than \`description\`.

I still have the habit of reaching for \`description\` as the property where I define a thing in words.

But RDF convention favors \`rdf:comment\` even for what you may consider
“definitive” statements.

We interpret “comment” as having a point of view.

“Description” implies a single, canonical writ.

Blessings do cost.

Preferring “comment” over “description” is an example of open-world design.
`,
    },
    {
      id: "blank-nodes",
      label: "blank nodes",
      comment: `blank nodes (a.k.a bnodes) are anonymous resources.  They are critical to the
expression of compound structures in RDF, because you don't want to have to
explicitly name everything.  Blank nodes are created when the system generates a
node for some reason`,
      userland_code: `// blank nodes 
isa . Person

// or for the literal form:
hasStrength(50)

// you can also use them in place of where a node would go
space . hasForce ( x(50) )

`,
    },

    {
      id: "subscription-cycle",
      label: "circular subscription",
      comment: `circular subscriptions should be okay as long as they are async`,
      userland_code: `Alice . listensTo . Bob
Bob . listensTo . Carol
Carol . listensTo . Alice

`,
    },

    {
      id: "projection",
      label: "project over",
      comment: `Support assertion of a link between any given resource and the expansion of a set.`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)
Frank . projectOver . x
foob . isa . Container

`,
    },

    {
      id: "containers",
      label: "container driver",
      comment: `declarative control over containment of things`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)
something . contains . x
blue .isa.Container
brown .isa.Container
blue.contains.x

`,
    },

    {
      id: "selection",
      label: "resource selection",
      comment: `collect the resources named in a selection`,
      userland_code: `Alice . knows . Bob
Alice . knows . Carol
Alice . knows . John
Emily . knows . Alice
x . tallies . ViewFacts
Bob.age(30)
Bob.weight(175)

`,
    },

    {
      id: "forcefield",
      label: "forcefield driver",
      comment: `testing reified forcefield (with query shorthand)`,
      userland_code: `Alice . knows . Bob
space.isa.Forcefield
space.hasForce.center
space.hasForce.charge
center.isa.forceCenter
charge.isa.forceManyBody
charge.strength(-200)
charge.distanceMax(250)
charge.theta(0.98)
//space.hasBodies(query(Alice.knows.$person))
space.hasBodies(query($subject.$predicate.$object))
// ticker . hasInterval(500)
ticker . isa . RAF
space.hasTicks.ticker

`,
    },
    {
      id: "forcefield-verbose",
      label: "forcefield driver",
      comment: `testing reified forcefield`,
      userland_code: `Alice . knows . Bob
space.isa.Forcefield
space.hasForce.center
space.hasForce.charge
center.isa.forceCenter
charge.isa.forceManyBody
charge.strength(-200)
charge.distanceMax(250)
charge.theta(0.98)
space.hasBodies.q
q . hasClause . clause1
clause1 . hasSubject . Alice
clause1 . hasPredicate . knows
clause1 . hasObject . $y

//query(Alice.knows.$person)

`,
    },

    {
      id: "representation",
      label: "representation driver",
      comment: `testing reified representations`,
      userland_code: `Alice . knows . Bob

`,
    },

    {
      id: "rules",
      label: "rule driver",
      comment: `testing reified rules`,
      userland_code: `rule1 . hasCondition . p1
rule1 . hasConsequent . c1
p1 . hasClause . pclause1
c1 . hasClause . cclause1
pclause1 . hasSubject . $x
pclause1 . hasPredicate . loves
pclause1 . hasObject . $y
cclause1 . hasSubject . $x
cclause1 . hasPredicate . likes
cclause1 . hasObject . $y

`,
    },

    {
      id: "queries",
      label: "query driver",
      comment: `testing reified queries`,
      userland_code: `query1 . isa . Query
clause1 . isa . Clause
clause1 . hasSubject . Alice
clause1 . hasPredicate . knows
clause1 . hasObject . $someone

clause2 . isa . Clause
clause2 . hasSubject . $someone
clause2 . hasPredicate . isa
clause2 . hasObject . Person

query1 . hasClause . clause1
query1 . hasClause . clause2
Alice.listensTo.query1
Alice.hostOutput("Alice")
`,
    },

    {
      id: "layers",
      label: "layers",
      comment: `TEMP layers hack`,
      userland_code: `s.hasSource(sub => { sub.next({layers: [
"billy", "jean", "is", "not", "my", "lover"
]}) })

home.contains.more
Alice.hasInterval(100)
vv.viewOf.Alice
vv.viewIn.more

v.viewOf.s
v.viewIn.thing
home.contains.thing
`,
    },

    {
      id: "layers-moving",
      label: "moving layers",
      comment: `Layers in a dataflow`,
      userland_code: `home.contains.more
// To get the desired effect here, you'd first have to use a partitioning step
// of 1, which isn't currently supported.
Alice(hasInterval(250), hostOutput("Alice"))
vv(viewOf.Alice, viewIn.more)

Bob(
  listensTo.Alice,
  // transformsWith(partitionsWith({size:5, step: 1})),
  transformsWith(partitionsBy(6)),
  hostOutput("Bob"))

home.contains.bcon
b(viewOf.Bob, viewIn.bcon)

home.contains.thing
v(viewOf.s, viewIn.thing)
s(listensTo.Bob,
  hostOutput("S"),
  transformsWith(mapsWith(layers => ({layers}))))
`,
    },

    {
      id: "space",
      label: "space driver",
      comment: `testing reified space`,
      userland_code: `s . isa . Space`,
    },

    {
      id: "forall",
      label: "forall macro",
      comment: `this may become a thing`,
      userland_code: `//forall(t, isa.Selected)
//forall(subgraph(forceCollide, subclassOf), isa.Selected)

`,
    },
    // TODO: interpreter macros
    {
      id: "classes",
      label: "organizing classes",
      comment: `rules for representing the graph of defined classes`,
      userland_code: `
sc.connects.subclassOf
sc.isa.forceLink
space.hasForce.sc
sc.strength(.8)
sc.distance(500)

forall(subgraph(forceCollide, subclassOf), isa.Selected)

${SPACE_COMMON}
`,
    },

    {
      id: "blank",
      label: "blank slate",
      comment: `type to see`,
      userland_code: `sc.connects.subclassOf
sc.isa.forceLink
space.hasForce.sc

${SPACE_COMMON}
`,
    },

    {
      id: "forall",
      label: "forall macro",
      comment: `assert properties about subjects`,
      userland_code: `forall([Alice, Bob], isa.Person)
foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo

${SPACE_COMMON}
`,
    },

    {
      id: "property-domain",
      label: "property domain",
      comment: `The domain of a property lets you infer the type of the subject in statements that use it.`,
      userland_code: `teaches.domain.Teacher
Alice.teaches.Bob
// so Alice is a Teacher
`,
    },

    {
      id: "property-range",
      label: "property range",
      comment: `The range of a property lets you infer the type of the object in statements that use it.`,
      userland_code: `teaches.range.Student
Alice.teaches.Bob
// so Bob is a Student
`,
    },

    {
      id: "inverse-properties",
      label: "inverse properties",
      comment: `Properties are directional.  Inverse properties let you give names to the “same” property in either direction.`,
      userland_code: `Alice.defeated.Bob
wasDefeatedBy.inverseOf.defeated

Bob.respects.Alice
respects.inverseOf.isRespectedBy
`,
    },

    {
      id: "symmetric-properties",
      label: "symmetric properties",
      comment: `A symmetric property is one that is always mutually true of its subject and object.  That is, it always applies in both directions`,
      userland_code: `Alice.isMarriedTo.Carol
isMarriedTo.isa.SymmetricProperty
`,
    },

    {
      id: "transitive-properties",
      label: "transitive properties",
      comment: `Relationships are not transitive unless you explicitly say so.`,
      userland_code: `Alice.isTheBossOf.Bob
Bob.isTheBossOf.Carol
isTheBossOf.isa.TransitiveProperty
`,
    },

    {
      id: "subclasses",
      label: "subclasses",
      comment: `Subclass relationships let you refine and specialize types.`,
      userland_code: `Bob.isa.Square
Square.subclassOf.Shape
`,
    },

    {
      id: "subproperties",
      label: "subproperties",
      comment: `Subproperty relationships let you refine and specialize properties.  Whatever is true of a property is also true of its subproperties.`,
      // ^ is that correct, or is it just true that s P o implies s P' o?
      userland_code: `wrote.subpropertyOf.created
Fitzgerald.wrote.TheGreatGatsby
// Fitzgerald created TheGreatGatsby
`,
    },

    {
      id: "subgraph",
      label: "subgraph selection",
      comment: `do an exhaustive search`,
      userland_code: `Alice . knows . Bob
Bob . knows . Carol
Carol . knows . Jake
Jake . knows .  Carol
Jake . knows .  Miriam
Miriam . knows .  Alice
Miriam . knows .  Bob

forall(subgraph(Alice, knows), isa.Selected)

foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo
${SPACE_COMMON}
`,
    },
    {
      id: "mesh-macro",
      label: "make a mesh",
      comment: `create a mesh of blank nodes`,
      userland_code: `mesh(3, 3)
//range(10)

foo.isa.forceLink
foo.id(_ => _.id)
foo.connects.linksTo
space.hasForce.foo

${SPACE_COMMON}
`,
    },
    {
      id: "code-in-world",
      label: "simple claims",
      comment: `testing expression reader`,
      userland_code: `Alice.loves.Bob
Bob.likes.Alice

${SPACE_COMMON}

`,
    },
    {
      id: "boggle",
      label: "boggle with solutions",
      comment: `the full boggle example, with path search`,
      userland_code: `// board = boggle_grid(10, 10)
// set of search?
// etc
`,
      /*
    async get_store() {
      const boggle_graph = random_board(BOARD_SIZE);
      const trie = await get_trie();
      const solutions = await solve(trie, boggle_graph);

      const ids = tx.transduce(
        tx.map(key => [key, mint_blank()]),
        tx.assocObj(),
        Object.keys(boggle_graph.nodes)
      );

      const solution_paths = solutions.map(_ => _[0]);
      const store = make_store();
      store.into(
        tx.map(
          ([s, o]) => trip(ids[s], "value", o),
          Object.entries(boggle_graph.nodes)
        )
      );

      store.into(
        tx.mapcat(
          ([s, targets]) =>
            tx.map(o => trip(ids[s], "linksTo", ids[o]), targets),
          Object.entries(boggle_graph.edges)
        )
      );
      return store;
    }
*/
    },
    /*
  {
    id: "trie-view-level-1",
    label: "trie level one",
    comment: `show the first node of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data)
            )
          },
          edges: { root: Object.keys(trie.data) }
        },
        paths: []
      };
    }
  },
  {
    id: "trie-view-level-2",
    label: "trie level two",
    comment: `show the first two levels of a trie`,
    // DISABLED: not going to convert this to triples as such, too messy
    async get_resources() {
      const trie = await get_trie();
      return {
        graph: {
          nodes: {
            root: "root",
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            ),
            ...tx.transduce(
              tx.map(k => [k, k]),
              tx.assocObj(),
              tx.mapcat(
                k =>
                  Object.keys(trie.data[k])
                    .filter(k => k.length === 1)
                    .map(k2 => k + k2),
                Object.keys(trie.data).filter(k => k.length === 1)
              )
            )
          },
          edges: {
            root: Object.keys(trie.data),
            ...tx.transduce(
              tx.map(k => [
                k,
                Object.keys(trie.data[k])
                  .filter(k => k.length === 1)
                  .map(k2 => k + k2)
              ]),
              tx.assocObj(),
              Object.keys(trie.data).filter(k => k.length === 1)
            )
          }
        },
        paths: []
      };
    }
  },
*/
    {
      id: "trie-prefix-1",
      label: "trie match 1",
      comment: `matching a term against trie`,
      userland_code: `// trie = willshake_words
// trie match/scan "qpoinspr"
// trie match/scan "hello"
// trie match/scan "world"
// trie node looks like render_trie_node
`,
    },
    {
      id: "graph2",
      label: "testing another graph",
      comment: `an example graph`,
      userland_code: `
a . value . Alice
b . value . Bob
c . value . Carol
d . value . Dave
a . linksTo . b
a . linksTo . c
b . linksTo . d

${SPACE_COMMON}
`,
    },
    {
      id: "graph3",
      label: "sequence as graph",
      comment: `turn a sequence into a graph`,
      userland_code: `list(Alice, Bob, Carol, Dave, Elon, Fran)

${SPACE_COMMON}

`,
    },

    {
      id: "range-1",
      label: "integer range",
      comment: `a range from zero up to the number`,
      userland_code: `range(10)

${SPACE_COMMON}

`,
    },
    {
      id: "cycle-1",
      label: "list cycle",
      comment: `make a list of the items with a linked head and tail`,
      userland_code: `range(10)

${SPACE_COMMON}

`,
    },
    {
      id: "graph4",
      label: "sequence as graph cycle",
      comment: `turn a sequence into a loop in a graph`,
      userland_code: `a = range(10)
b = cycle(a)
`,
    },
    {
      id: "graph5",
      label: "two separate structures on a graph",
      comment: `union of two independent generated sequences`,
      userland_code: `cycle(range(10))
range(20, 25)
`,
    },
    {
      id: "view-refinement",
      label:
        "You can describe aspects of the appearance of particular types of things.",
      status: "TODO",
    },
    {
      id: "view-refinement-examples",
      label:
        "Make examples illustrating the essentials of refining appearance by type.",
      status: "TODO",
    },
    {
      id: "implement-view-refinement",
      label: "Make the view refinement examples work.",
      status: "TODO",
    },
    {
      id: "stream-metamerge-bug",
      label:
        "Fix a bug where metamerge is getting created on streams.  Apparently a no-op for intervals (because of ordering), so it's gone unnoticed",
      status: "DONE",
    },
    {
      id: "trace-rule-firing",
      label:
        "The system could trace which rules fired and with what.  #deathtoconsolelog",
      status: "TODO",
    },
    {
      id: "regarding-collection-size",
      comment: "I was looking for a term for collection size",
      seeAlso: [
        "http://www.essepuntato.it/lode/http://purl.org/co#d4e381",

        "https://lov.linkeddata.es/dataset/lov/vocabs/coll",

        "http://www.essepuntato.it/lode/http://purl.org/co",

        "https://www.semanticscholar.org/paper/The-Collections-Ontology%3A-Creating-and-handling-in-Ciccarese-Peroni/178c76c504a2ea96c23947060537a5ac48e3c5ae",

        "https://www.researchgate.net/publication/256803144_The_Collections_Ontology_Creating_and_handling_collections_in_OWL_2_DL_frameworks",

        "http://semantic-web-journal.net/content/collections-ontology-creating-and-handling-collections-owl-2-dl-frameworks-0",
      ],
    },
    {
      id: "things-to-datafy",
      label: "A list of things in JavaScript hosts that invite datafication",
      value: ["Error", "Response", "Node"],
    },
    {
      id: "merge-examples-and-mind-map",
      status: "DONE",
      comment:
        "No need to convert to JSON.  Exporting as a module because line breaks.",
      label: "Merge with MELD examples.",
    },
    {
      id: "merge-presentation-slides-and-mind-map",
      status: "TODO",
      label:
        "Convert topics from presentation sketch to JS nodes and merge with mind map.",
      comment:
        "No need to convert to JSON.  Exporting as a module because line breaks.",
    },
    {
      id: "index-display-from-mind-map",
      status: "TODO",
      label:
        "The index page needs to be updated to deal with a heterogeneous set of items",
      comment:
        "will hold off on this I guess until I've processed it in a model a bit",
    },
    {
      id: "host-input",
      status: "TODO",
      label:
        "Model host should provide the mind map to the model as an input port",
    },
    {
      id: "implement-host-input",
      status: "DONE",
      label:
        "Add vocabulary and driver as needed.  Host input port will be a stream",
      supports: "host-input",
    },
    {
      id: "dynamic-polymorphic-render",
      status: "TODO",
      label: "Create a dynamic, (single-dispatch) polymorphic render apparatus",
    },
    {
      id: "polymorphic-methods",
      status: "DONE",
      label:
        "Dynamically-extensible polymorphic dispatch mechanism using multimethods.",
      supports: "datafy-nav",
    },
    {
      id: "implement-polymorphic-methods",
      status: "DONE",
      label: "Implement basic defprotocol using @thi.ng multimethods",
      comment: `well, almost done.  still doesn't retrofit new multimethods with existing hierarchy`,
      supports: "protocols",
    },
    {
      id: "datafy-nav",
      status: "TODO",
      label: "Extensible datafy and nav protocols using JSON-LD conventions.",
    },
    {
      id: "implement-datafy-nav",
      status: "DONE",
      label: "Create basic datafy nav protocols (loosely) after Clojure",
    },
    {
      id: "create-dynamic-polymorphic-render",
      status: "TODO",
      label: "Create a dynamic, (single-dispatch) polymorphic render apparatus",
      supports: "dynamic-polymorphic-render",
    },
    {
      id: "create-dynamic-polymorphic-render-driver",
      status: "TODO",
      label: "Create driver for dynamic polymorphic render",
      supports: "dynamic-polymorphic-render",
    },
    {
      id: "provide-mind-map-as-input",
      status: "TODO",
      label:
        "Model host should provide the mind map to the model as an input port",
      comment: "requires hostInput support",
    },
    {
      id: "convert-examples-to-json",
      status: "NOT-TODO",
      comment: `But JSON doesn't allow line breaks in strings.  So there's no way I'm editing that manually.`,
      label: "Convert MELD examples to JSON.",
    },
    {
      id: "http-dereference-driver",
      status: "DONE",
      label:
        "A driver for providing the content of resources with HTTP/HTTPS IRI's.",
    },
    {
      id: "create-http-dereference-vocabulary",
      status: "DONE",
      label:
        "create vocabulary for representing HTTP resources as stream sources.",
      supports: "http-dereference-driver",
    },
    {
      id: "create-http-dereference-driver",
      status: "",
      label: "create driver for implementing HTTP vocabulary as stream source.",
      supports: "http-dereference-driver",
    },
    {
      id: "javascript-modules",
      comment: `This is just for local development, currently not intended for userland`,
      label: "A vocabulary for talking about JavaScript modules.",
    },
    {
      id: "create-javascript-modules-vocabulary",
      label: "A vocabulary for talking about JavaScript modules.",
      comment: `Basically punting.  Assuming needed semantics will arise.`,
      status: "DONE",
      supports: "javascript-modules",
    },
    {
      id: "implement-javascript-module-import-driver",
      label: "Create a driver for importing JavaScript modules.",
      status: "DONE",
      supports: "javascript-modules",
    },
    {
      id: "create-test-case-vocabulary",
      status: "DONE",
      label: "create a simple vocabulary for describing functional test cases",
      supports: "function-testing",
    },
    {
      id: "create-test-case-format",
      label:
        "create test case format compatible with TypeScript and vocabulary",
      status: "DONE",
      supports: "function-testing",
    },
    {
      id: "convert-existing-tests",
      label: "convert existing tests to function test case format",
      status: "DONE",
      supports: "function-testing",
    },
    {
      id: "create-function-test-runner",
      label: "create runner for test case format",
      status: "DONE",
      supports: "function-testing",
    },
    {
      id: "create-function-testing-cli",
      label: "create function testing CLI",
      status: "DONE",
      supports: "function-testing",
    },
    {
      id: "create-function-testing-driver",
      label: "create function testing driver",
      status: "TODO",
      supports: "function-testing",
    },
    {
      id: "support-indirect-function-reference-in-map",
      label:
        "Allow mapping function to be specified as a term whose value is a function, rather than a literal",
      comment: `I just created a special xform for my immediate purpose.  No polymorphism for now.`,
      status: "DONE",
    },
    {
      id: "SeeLevel",
      label: "see-level",
      comment: `A name for the membrane that divides userspace from the invisible things.`,
    },
    {
      id: "ProtocolPolymorphism",
      comment: `To implement a protocol is to participate in polymorphism.  The mechanism
for polymorphism will be first-class if necessary, and should afford the
same power to all comers (from abover or below see level).`,
    },
    {
      id: "load-existing-tests",
      label: "load and run existing tests via drivers",
      status: "DONE",
      supports: "function-testing",
    },
    {
      id: "describe-test-result-representation",
      label: "Describe test result representation",
      status: "BLOCKED",
      blockedBy: "view-refinement",
      supports: "function-testing",
    },
    {
      id: "get-data-from-model",
      label: "support getting outside from model",
      status: "TODO",
      supports: "function-testing",
    },
    {
      id: "add-pluck-transducer",
      label: "Add pluck transducer",
      status: "DONE",
    },
    {
      id: "pluck-as-action-and-description",
      label: "Pluck as action and description",
      comment:
        "Picking out part of a represented value should capture the description of a pluck operation, which can be reified and turned into a transducer.",
      status: "IDEA",
    },
    { id: "meld-mind-map", label: "mind map" },
    { id: "function-testing", label: "function testing" },
    { id: "create-meld-mind-map", label: "DONE create meld mind map" },
    { id: "https://www.w3.org/TR/json-ld/", label: "JSON-LD" },
  ],
};
