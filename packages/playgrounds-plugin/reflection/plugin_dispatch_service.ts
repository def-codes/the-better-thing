import { Response, STATUS, with_path_mount } from "mindgrub-node";

const response = (status: keyof typeof STATUS, content: object): Response => ({
  ...STATUS[status],
  headers: { "Content-type": "application/json" },
  content: JSON.stringify(content),
});

/** Create a handler to execute code against a tsserver instance. */
export const plugin_dispatch_service = (info: ts.server.PluginCreateInfo) =>
  with_path_mount({
    mappings: [
      {
        path: "exec",
        handler: request => {
          const code = request.body;
          if (!code)
            return response("BAD_REQUEST", {
              error: "Expected code in request body.",
            });

          let fn;
          try {
            // `code` is the code of the entire function, not just the body.
            fn = new Function("info", `return (${code})(info)`);
          } catch (error) {
            return response("BAD_REQUEST", {
              error: `Error creating function: ${error.toString()}`,
            });
          }

          try {
            return response("OK", { result: fn(info) });
          } catch (error) {
            return response("OK", {
              error: `Error executing function: ${error.toString()}`,
            });
          }
        },
      },
    ],
  });
