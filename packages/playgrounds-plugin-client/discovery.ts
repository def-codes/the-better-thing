/** Kind of a client-side reflection.  Contact well-known sources, look
 * around. */

import { delayed } from "@thi.ng/compose";
import { deserialize_query } from "@def.codes/simple-http-server";
import { path } from "@def.codes/helpers";
import {
  SystemSink,
  Multicast,
  MulticastType,
  Channel,
  System,
  GeneratorProcess,
} from "@def.codes/meld-process";

import { serialize_dot } from "@def.codes/graphviz-format";
import { object_graph_to_dot } from "./general-object-to-graphviz";
import { encode_text } from "./xml-helpers";

// DUPLICATED: this is in both client and server because it's not worth
// modifying build to share just this; see also note in `README`.

const is_object = (x): x is object => x !== null && typeof x === "object";

const reflection = {
  SOCKET_PORT_KEY: "reflection_port",
  DEFAULT_SITE_PORT: "9900",
  DEFAULT_SOCKET_PORT: "9901",
};

// COPIED from shim_amd_require in bootstrapper
declare global {
  interface Window {
    redefine_module: (module_id: string, code: string) => Promise<object>;
  }
}

const html_escape = s => encode_text(s || "");

/** Return JSON for the given object or null if an error occurs. */
const safe_stringify = (o, ...rest) => {
  try {
    return JSON.stringify(o, ...rest);
  } catch {
    return null;
  }
};

const json_html = o => html_escape(safe_stringify(o, null, 2));

type Adjuster = (ele: Element) => Element | void;

const ensure = (box: Element, tag: string, query: string, adjust: Adjuster) => {
  const existing = box.querySelector(query);
  if (existing) return existing;
  const outer = box.insertBefore(document.createElement(tag), box.firstChild);
  return adjust(outer) || outer;
};

const modules_box = () =>
  ensure(document.body, "div", "#modules", ele => {
    ele.id = "modules";
  });

const module_box = name =>
  ensure(modules_box(), "section", `[data-module="${name}"]`, ele => {
    ele.appendChild(document.createElement("h1")).innerHTML = name;
    const box = ele.appendChild(document.createElement("div"));
    box.setAttribute("data-module", name);
    return box;
  });

const export_box = (module_name, name) =>
  ensure(module_box(module_name), "section", `[data-export="${name}"]`, ele => {
    ele.appendChild(document.createElement("h2")).innerHTML = name;
    const box = ele.appendChild(document.createElement("div"));
    box.setAttribute("data-export", name);
    return box;
  });

async function render_value(value, key) {
  // SPECIAL CASE: execute code against tsserver and show result.
  if (key === "plugin_reflect" && typeof value === "function") {
    const body = value.toString();
    const response = await fetch("/plugin/exec", { method: "POST", body });
    const json: { result?: any; error?: any } = await response.json();
    // Could return this, but fall through so it's rendered like other objects.
    value = json.result || json;
  }

  // Render DOM elements as-is.
  if (value instanceof HTMLElement) return value.outerHTML;

  // SPECIAL CASE: recognize Graphviz as such.
  if (value["@context"] === "http://graphviz.org/#Graph") {
    // Just like below, except that you don't do `object_graph_to_dot`.
    const body = serialize_dot(value);
    const request = fetch("/graphviz/dot", { method: "POST", body });
    return fix_svg(await (await request).text());
  }

  // Display objects as Graphviz graphs
  if (is_object(value)) {
    const body = serialize_dot(object_graph_to_dot(value));
    const request = fetch("/graphviz/dot", { method: "POST", body });
    return fix_svg(await (await request).text());
  }

  return json_html(value);
}

const wrap = markup => `<div style="white-space: pre">${markup}</div>`;

const box = markup =>
  `<div style="display: inline-block; vertical-align: top; margin-right: 1em">${markup}</div>`;

const render_module = async (exports, name) => {
  if (!is_object(exports)) return json_html(exports);

  for (const [key, value] of Object.entries(exports)) {
    const container = export_box(name, key);
    const rendered = await render_value(value, key);
    container.innerHTML = box(wrap(rendered));
  }
};

/** Listen to events on a new websocket and return a promise that resolves when
 * it closes. */
const socket_connection = (
  url: string,
  message_handler: (event: MessageEvent) => void
) =>
  new Promise(resolve => {
    const ws = new WebSocket(url);
    ws.addEventListener("message", message_handler);
    ws.addEventListener("close", resolve);
  });

/** Remove explicit width and height from SVG so it scales (I know right). */
function fix_svg(full_svg: string) {
  const match = full_svg.match(/\<svg\s[\s\S]*$/);
  let [svg] = match || [""];
  return svg.replace(/\s+(?:width|height)\s*=\s*(['"])[\s\S]*?\1/g, " ");
}

const process_messages: GeneratorProcess = function* process_messages(
  messages: Channel
) {
  for (;;) {
    const message = yield this.take(messages);
    if (message.emit && message.path) {
      const file = path(message.emit, "outputFiles", 0);
      if (!file) continue;
      const { name, text } = file;
      if (!name || !text) continue;
      yield window
        .redefine_module(message.path, text)
        .then(value => render_module(value, message.path));
    }
  }
};

// This is essentially an async process, but it's not managed.
async function attempt_to_contact_reflection_server(messages: Channel) {
  const query = deserialize_query(window.location.search);
  const reflection_host = window.location.hostname;
  const reflection_port =
    query[reflection.SOCKET_PORT_KEY] || reflection.DEFAULT_SOCKET_PORT;
  const reflection_socket_address = `ws://${reflection_host}:${reflection_port}`;
  for (;;) {
    await socket_connection(reflection_socket_address, event => {
      try {
        const message = JSON.parse(event.data);
        messages.put(message);
      } catch (error) {
        console.error("Error parsing message JSON", event);
      }
    });
    await delayed(true, 1000);
  }
}

// This is a bad idea.  Spams the console.
// const make_console_sink = (name): SystemSink => (pid, message) =>
//   console.info(name, pid, message);

const REFLECTION_SINK = Symbol.for("reflection-sink");

// This is not much better.
const make_multicast_sink = (multicast: MulticastType): SystemSink => (
  pid,
  message
) => {
  multicast.send({ pid, message });
};

const discovery_main: GeneratorProcess = function* discovery_main() {
  const messages = new Channel(10);
  attempt_to_contact_reflection_server(messages);
  this.spawn(process_messages, [messages]);
};

export function discovery_init() {
  const multicast = new Multicast();
  //new System(discovery_main, [], make_console_sink("discovery"));
  new System(discovery_main, [], make_multicast_sink(multicast));
  window[REFLECTION_SINK] = multicast;
}
