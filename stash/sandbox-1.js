// let's build us a dataflow!

// alice = timer(1000);
// bob.listensTo.alice;

a = watch("some/directory");

b = a.filter(_ => _.type === "change");

c = b.map(readfile);

d = c.map(read_expressions);

// the.beatles = [John, Paul, George, Ringo];

// set.my.family([Aria, Kim, Gavin, Tremé]);

// bob.has().a.great.big.philosophy;

// this is “unsupported”
// sdf[silicon];

// a = things(and(stuff));
