import * as child_process from "child_process";

// No Buffer.concat, for Node 6 compat
function concat_buffers(buffers: Iterable<Buffer>) {
  let length = 0;
  for (let buffer of buffers) length += buffer.length;

  const out = new Buffer(length);
  var pos = 0;
  for (let buffer of buffers) {
    buffer.copy(out, pos);
    pos += buffer.length;
  }
  return out;
}

export interface ShellCommandResult {
  status: number;
  stdout: Buffer;
  stderr: Buffer;
}

/** Run a shell process with the given input text and resolve to its stdout. */
export const shell_command = async (
  command: string,
  args?: any[],
  input?: string
) =>
  new Promise<ShellCommandResult>((resolve, reject) => {
    const child = child_process.spawn(command, args);
    const stdout: Array<Buffer> = [];
    const stderr: Array<Buffer> = [];
    // It hasn't come up yet, but this seems liable to losing unflushed data on
    // process close.  See
    // https://github.com/nodejs/node-v0.x-archive/issues/6595
    child.on("error", reject);
    child.on("close", status => {
      resolve({
        status,
        stdout: concat_buffers(stdout),
        stderr: concat_buffers(stderr),
      });
    });
    // Asserting that these are `Buffer` instead of `Buffer | string` because
    // encoding is not set.
    child.stdout.on("data", (data: Buffer) => stdout.push(data));
    child.stderr.on("data", (data: Buffer) => stderr.push(data));
    if (input) {
      // Typescript is saying `setEncoding` doesn't exist on `Writable`...
      // @ts-ignore
      child.stdin.setEncoding("utf-8");
      child.stdin.write(input);
      child.stdin.end();
    }
  });

/** Run a fixed shell command using input values as stdin and yield stdout. */
/*
export const shell_command_process: GeneratorProcess = function* shell_command_process(
  input: Channel<string>,
  output: Channel<string>,
  command: string,
  args?: string[]
) {
  for (;;) {
    const value = yield this.take(input);
    const result = yield shell_command(command, args, value);
    yield this.put(output, result.stdout.toString("utf-8"));
  }
};
*/
