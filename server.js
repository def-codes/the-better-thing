server = WebSocketServer({ port: 1234 });
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
