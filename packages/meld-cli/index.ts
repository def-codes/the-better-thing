import { main } from "@def.codes/meld";

const state = {};

// See what little we can get away with.
main(process.argv.slice(2), process.env, state);
