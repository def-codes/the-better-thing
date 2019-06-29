import { sub_blank_nodes } from "./system.mjs";
import { as_turtle } from "./turtle.mjs";

// Hack for browser/node support
import * as tx1 from "../node_modules/@thi.ng/transducers/lib/index.umd.js";
const tx = Object.keys(tx1).length ? tx1 : thi.ng.transducers;

const identity = x => x;

export const interpret = statements =>
  tx.transduce(
    tx.comp(
      tx.map(as_turtle),
      tx.keep(),
      tx.map(sub_blank_nodes),
      tx.mapcat(identity)
    ),
    tx.push(),
    statements
  );
