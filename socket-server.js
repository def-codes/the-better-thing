const pt = require("@def.codes/process-trees");

const a_web_socket_server = {
  "@type": pt.WEBSOCKET_SERVER_TYPE_IRI,
  host: "0.0.0.0",
  port: 1234,
};

// Now assert that the thing described there exists
const fake_system = {};
const thing_itself = pt.reify(a_web_socket_server, fake_system);
// console.log(`thing_itself`, thing_itself);
thing_itself.addListener("state", state => {
  console.log(`state`, state.value);
});
