const WebSocket = require("ws");
const pt = require("@def.codes/process-trees");
const { datafy } = require("@def.codes/datafy-nav");

const a_web_socket_server = {
  "@type": pt.WEBSOCKET_SERVER_TYPE_IRI,
  host: "0.0.0.0",
  port: 1234,
};

// Now assert that the thing described there exists
const fake_system = {
  reflect(instance, extended) {
    const description = datafy(instance);
    if (extended)
      for (const [key, value] of Object.entries(extended))
        if (description[key] === undefined) description[key] = value;
    console.log(`description`, description);
  },
};
const thing_itself = pt.reify(a_web_socket_server, fake_system);
// console.log(`thing_itself`, thing_itself);
thing_itself.addListener("state", state => {
  console.log(`state`, state.value);
});

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));
(async function() {
  for (let x = 0; x < 0; x++) {
    // connect to the server
    const client = new WebSocket("ws://localhost:1234");
    console.log(`client`, client);

    await timeout(2000);
  }
  await timeout(2000);
  // cheating, etc
  thing_itself.state.instance.close();
})();

module.exports = {
  main() {
    return thing_itself;
  },
};
