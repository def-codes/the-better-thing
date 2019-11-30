import * as rs from "@thi.ng/rstream";

interface ModuleContext {
  // the path from which this module is being rererenced
  reference_path: string;
}

// create a stream that resolves to the exports of the identified module id in
// the given context.
export const module_stream = (
  id: string,
  context: ModuleContext
): rs.StreamSource<any> => sub => {
  const resolved = require.resolve(id, { paths: [context.reference_path] });
  const exported = require(resolved);
  sub.next(exported);
};
