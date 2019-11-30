import { graph } from "../../vocabulary";
import { dotify_protocol } from "../protocols";
import { object_graph_to_dot } from "../../general-object-to-graphviz";

export const extend_Object = {
  dotify() {
    // TODO: provide a composable implementation
    dotify_protocol.extend(Object, obj => object_graph_to_dot([obj]));
  },
};
