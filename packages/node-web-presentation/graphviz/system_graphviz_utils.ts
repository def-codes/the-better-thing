import * as Dot from "@def.codes/graphviz-format";

// TEMP
type SinkLogEntry = { pid; message; channel?: number };
type SinkLog = SinkLogEntry[];

/** Tools for converting a process's message log to GraphViz format. */

// Do substring then escape to avoid breaking in the middle of an escape sequence
const dot_safe = o =>
  o == null
    ? "(null/undefined)"
    : o
        .toString()
        .substring(0, 50)
        .replace(/"/g, '\\"')
        .replace(/\$/, "");

function* system_log_to_dot_statements(
  log: SinkLog
): IterableIterator<Dot.Statement> {
  const links = new Map();
  const channels = new Set<number>();

  for (const { pid, message } of log) {
    const { init, spawned, channel } = message;

    if (typeof channel === "number") {
      // "chain" of values between process and chan
      const operation = "put" in message ? "put" : "take";
      const value = message[operation];
      const link_id = `link_${pid}_${channel}_${operation}`;
      channels.add(channel);

      // Get and increment the value count for this node/channel/operation tuple
      let value_index = 1;
      if (links.has(link_id)) value_index = links.get(link_id) + 1;
      links.set(link_id, value_index);

      // Write a node for this value
      const value_id = `${link_id}_${value_index}`;
      yield {
        type: "node",
        id: value_id,
        attributes: { shape: "none", label: value },
      };

      // Connect this value to the previous one
      if (value_index > 1) {
        const previous_value_id = `${link_id}_${value_index - 1}`;
        yield { type: "edge", from: value_id, to: previous_value_id };
        // else yield `${previous_value_id} -> ${value_id}`;
      }
    } else if (spawned) {
      // Spawned child process
      const spawned_node = `process_${spawned.pid}`;
      yield {
        type: "node",
        id: spawned_node,
        attributes: {
          shape: "circle",
          label: spawned.fn.replace(/_/g, "\\n"),
          xlabel: spawned.pid,
        },
      };
      yield {
        type: "edge",
        from: pid,
        to: spawned_node,
        attributes: {
          style: "dotted",
          label: spawned.args
            ? spawned.args.map(JSON.stringify).join("\\n")
            : "",
        },
      };
    } else if (init) {
      // pid should be zero
      const node = `process_${pid}`;
      yield {
        type: "node",
        id: node,
        attributes: {
          shape: "doublecircle",
          label: init.fn.replace(/_/g, "\\n"),
          xlabel: init.pid,
        },
      };
    }
  }
  // Write channel nodes
  for (const channel of channels)
    yield {
      type: "node",
      id: `channel_${channel}`,
      attributes: { shape: "cylinder", label: channel },
    };

  // Finalize process-> channel chains
  for (let [key, count] of links.entries()) {
    const [pid, channel, operation] = key.split("_").slice(1);
    if (operation === "put") {
      yield { type: "edge", from: `process_${pid}`, to: `${key}_${count}` };
      yield { type: "edge", from: `${key}_${1}`, to: `channel_${channel}` };
    }
    // For takes, connect the last node in the chain to the channel
    if (operation === "take") {
      yield { type: "edge", from: `channel_${channel}`, to: `${key}_${count}` };
      yield { type: "edge", from: `${key}_${1}`, to: `process_${pid}` };
    }
  }
}

export const system_log_to_dot = (log: SinkLog): Dot.Graph => ({
  type: "graph",
  directed: true,
  statements: [...system_log_to_dot_statements(log)],
});
