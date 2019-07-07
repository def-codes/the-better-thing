import { datafy_protocol } from "../datafy-protocol";

export function datafy_RegExp() {
  // If you actually use JSON-LD, then you shouldn't need to actually namespace
  // these, but just provide '@context'
  datafy_protocol.extend(RegExp, re => ({
    "regex:source": re.source
  }));
}
