import * as tx from "@thi.ng/transducers";
import { sub_blank_nodes } from "./system";
import { as_turtle } from "./turtle";

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
