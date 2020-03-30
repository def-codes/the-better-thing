// This is a definition of a thing, using a special reader and interpreter.
//
// The result (at one stage) is a function (of an `arguments` object?) that
// returns a description of a thing.  Currently, that description primarily
// comprises a dictionary of children, whose values are in turn descriptions of
// things?  But if that's the case, where does it end?  Right.  The difference
// must be that *this* thing doesn't decide what the children of the children
// are.  They must be determined by the definitions given by their
// prototype/constructor.
//
// This actually doesn't throw.  Mayyyyybe special-case this for interpreter?
const { port } = arguments;

// A = model(args => {
//   b = timer(args.interval);
//   c = factorial(b);
//   B = model(() => {
//     whatever = etc;
//   });
// });

A = model => {
  b = timer(args.interval);
  c = factorial(b);
  B = model => {
    whatever = etc;
  };
};

/*
A = model({
  b: timer(_arguments.interval),
  c: factorial(b),
  B: model({
    whatever: etc,
  }),
});

A = model(
  (b = timer(_arguments.interval)),
  (c = factorial(b)),
  (B = model((whatever = etc)))
);


model(A);
b = timer(arguments.interval);
c = factorial(b);
*/
// with (B) {
//   whatever = etc;
// }

/*
A = class {
  b = timer(_arguments.interval);
  c = factorial(b);
  B = class {
    whatever;
  };
};
*/
a = b(1000);
/*
server = WebSocketServer({ port });
client1 = WebSocket("ws://localhost:1234");

blah = server.error;
trace = ConsoleSink();
trace.listensTo(blah);

// or, with blank node construction
trace.listensTo(server.error);
// or event
ConsoleSink().listensTo(server.error);
// or if you want to just end up back where you started,
log(server.error);
// where `log` is a macro

// all of that supposes that WebSocket has enough metadata to map that to a listener

// let's describe a port on *this* thing
this.out;

server.listening;
server.connection;
server.error;
server.close;
*/
