// simplest dataflow we can implement

// A(B(C));
// A(B)(C);

// this currently yields a graph, which is not so good
// a((b = x));

// // also yields a graph
// (foo = bar).fairbanks;

// (x = y)((z = w));

// (p.q = y.z)((z = w));

// prettier-ignore
// a.b.c;
// prettier-ignore
// (a.b).c;
// prettier-ignore
// (a).b.c;

// unintuitive result
a.b = c;

// d = f;
// c(d);
// e(f);

// dd = {
//   a: "one",
//   b: "two",
// };

// x;
// y.z;
// p();
// p.q();
// m = n.o;
// a = ticker(1000);
// simplest dataflow we can implement

// A(B(C));
// A(B)(C);

// this currently yields a graph, which is not so good
// a((b = x));

// // also yields a graph
// (foo = bar).fairbanks;

// (x = y)((z = w));

// (p.q = y.z)((z = w));

// prettier-ignore
// a.b.c;
// prettier-ignore
// (a.b).c;
// prettier-ignore
// (a).b.c;

// unintuitive result
// a.b = c;

// d = f;
// c(d);
// e(f);

// dd = {
//   a: "one",
//   b: "two",
// };

// x;
// y.z;
// p();
// p.q();
// m = n.o;
// a = ticker(1000);
// b = map(a, x => x * 2);
