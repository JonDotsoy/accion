import { readableStreamToJSON, readableStreamToText, spawn } from "bun";

type Opt = {
  cmd: string[];
  pwd?: string;
};

const runExec = async (opt: Opt) => {
  console.log(`>> run: ${opt.cmd.join(" ")}`);
  const subprocess = spawn(opt);
  const exitCode = await subprocess.exited;
  if (exitCode !== 0) throw new Error(`Exit code ${exitCode}`);
  return subprocess;
};

export const execToText = async (opt: Opt) => {
  const subprocess = await runExec(opt);
  return await readableStreamToText(subprocess.stdout);
};

export const execToJSON = async (opt: Opt) => {
  const subprocess = await runExec(opt);
  return await readableStreamToJSON(subprocess.stdout);
};
