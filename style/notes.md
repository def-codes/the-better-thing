
# Identifiable

Is a thing with *its own* hashtag

An identifiable thing should have a link to itself.

That link should bear a label of the thing


> What is namespace context here?

In pseudoTurtle:

    ∀
      ?thing a :Identifiable .
    ∃
      // refersTo?
      ?link :pointsTo ?thing .
      ?link :labels thing .

# Open details

When a detail element is in the open state

It has more tokens

To spend on drilling

`open` details can drill a little further.

Now, about that open state.  You know what happens when the thing is no longer
open?

I would donate to a rule that carried out the further-drilling-down of things
matching within the context of an open details container.

# bootstrapping by duplication and variation

How much of this system could you drag-and-drop?  I mean, could you bootstrap a
whole thing through drag and drop?  Can that script execute in your page, as if
it were your own script?

This is navigation by expansion.  And it's monotonic.

But isn't it dataflow driven?

No!  The stream input is really just a propellor.  This trampolining could be
done synchronously.  In which case you would have to query the rules so.  As it
is, it's easier to subscribe to them as a stream.  Likewise, you have reason to
believe the dom will have changed, if the dataflow creates some elements itself.
So then you re-run the XPath queries.

A trampolining between datalog- and tree-traversal-style query languages.

The fact that you have a long-lived process, though... will for the hdom you
won't.  Basically when a dom assertion fires, just apply the operations.
Minting dom nodes is not “free,” but the cost is not like computational cost,
and anyway some minting is necessary to drive the process, so it should not dry
up too quickly.

You don't need a long-lived process for the render.  Is that getting through?
The satisfaction of assertions is discounted.

Still, what happens?

The matching elements are noticed, and the assertion is made.  Now, what do you
do when the assertion is true?  That's what I meant earlier... you want to be
able to assert the condition.  Else you have to make a template that just
repeats the pattern.  But in essence, you describe a pattern with some
placeholders.

# possible crazy hack for detecting variable dereferencing during XPath eval

Crazy idea.  Does xpath eval in fact take an object as context?  Or give you a
callback for resolving variables?  If not the latter, you could use getters or
proxy to tell which variables were evaluated.

# there-exists assertions for DOM

Yet, we have to express the thing that we want to exist as a template.  But we
first need to assert whether an equivalent thing exists already.  And how do we
test equivalency, accounting for placeholders?

That's supposing that we treating this as a “there exists”.  But we will not be
able to prevent the redundant evaluation of the query expressions.  So you will
need a fast and reliable way to test whether or not the assertion made by this
rule has already been applied to this element.  That's some bookkeeping.  The
SPARQL side does this as `?thing implements ?subject as ?type`

This duet, by the way, is browser-only, and that's fine.

The things we add are not going to go away.  We're just going to grow them,
or tuck them away.

If you're three levels deep, you should be three levels deep.


This serves as an assertion, and we can make these for "free".
Well I mean there must be some cost to minting them.
