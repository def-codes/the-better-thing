/** Tools for converting a process's message log to GraphViz format. */

// Do substring then escape to avoid breaking in the middle of an escape sequence
const dot_safe = o =>
  o == null
    ? "(null/undefined)"
    : o.toString().substring(0, 50).replace(/"/g, '\\"').replace(/\$/, "");

function* digraph_lines_from(log, formatter) {
  //yield "forcelabels=true";
  //yield "layout=dot";
  //yield `quadtree=false`;
  if (typeof formatter !== "function") formatter = JSON.stringify;
  const links = new Map();
  const channels = new Set();
  const format = x => dot_safe(formatter(x));

  for (let { pid, message } of log) {
    const { init, spawned, channel } = message;

    if (typeof channel === "number") {
      // "chain" of values between process and chan
      const is_put = "put" in message;
      const value = is_put ? message.put : message.take;
      const operation = is_put ? "put" : "take";
      const link_id = `link_${pid}_${channel}_${operation}`;
      //const process_node = `process_${pid}`;
      //const channel_node = `channel_${channel}`;
      channels.add(channel);

      // Get and increment the value count for this node/channel/operation tuple
      let value_index = 1;
      if (links.has(link_id)) value_index = links.get(link_id) + 1;
      links.set(link_id, value_index);

      // Write a node for this value
      const value_id = `${link_id}_${value_index}`;
      yield `${value_id} [shape=none label="${format(value)}"]`;

      // Connect this value to the previous one
      if (value_index > 1) {
        const previous_value_id = `${link_id}_${value_index - 1}`;
        yield `${value_id} -> ${previous_value_id}`;
        // else yield `${previous_value_id} -> ${value_id}`;
      }
    } else if (spawned) {
      // Spawned child process
      const spawned_node = `process_${spawned.pid}`;
      yield `${spawned_node} [shape=circle label="${spawned.fn.replace(
        /_/g,
        "\\n"
      )}" xlabel="${spawned.pid}"]`;
      yield `process_${pid} -> ${spawned_node} [style=dotted label="${
        spawned.args ? spawned.args.map(format).join("\\n") : ""
      }"]`;
    } else if (init) {
      // pid should be zero
      const node = `process_${pid}`;
      yield `${node} [shape=doublecircle label="${init.fn.replace(
        /_/g,
        "\\n"
      )}" xlabel="${init.pid}"]`;
    }
  }
  // Write channel nodes
  for (let channel of channels)
    yield `channel_${channel} [shape = cylinder label="channel ${channel}"]`;

  // Finalize process-> channel chains
  for (let [key, count] of links.entries()) {
    const [pid, channel, operation] = key.split("_").slice(1);
    if (operation === "put") {
      yield `process_${pid} -> ${key}_${count}`;
      yield `${key}_${1} -> channel_${channel}`;
    }
    // For takes, connect the last node in the chain to the channel
    if (operation === "take") {
      yield `channel_${channel} -> ${key}_${count}`;
      yield `${key}_${1} -> process_${pid}`;
    }
  }
}

export const system_digraph_from = (log, formatter?) =>
  ["digraph {", ...digraph_lines_from(log, formatter), "}"].join("\n");
