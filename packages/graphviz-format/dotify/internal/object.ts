import { graph } from "../../vocabulary";
import { dotify_protocol } from "../protocols";

export const extend_Object = {
  dotify() {
    // TODO: provide a general implementation
    dotify_protocol.extend(Object, obj =>
      graph({ statements: [{ type: "node", id: "WIP" }] })
    );
  },
};
