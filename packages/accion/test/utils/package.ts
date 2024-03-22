import { type NodeBins } from "./node_cli";
import { execToJSON } from "./exec";
import fs from "fs/promises";

const packsFolders = new URL("__packs__/", import.meta.url);
await fs.mkdir(packsFolders.pathname, { recursive: true });

type Detail = {
  entryCount: number;
  id: string;
  name: string;
  version: string;
  size: number;
  shasum: string;
  integrity: string;
  filename: string;
  files: { path: string; size: number; mode: number }[];
};

export const getPack = async function* (
  nodeBins: NodeBins,
  workspacePath: URL | string,
) {
  const workspace = new URL(workspacePath);
  const o = await execToJSON({
    cmd: [nodeBins.npm.path, "pack", "--json"],
    pwd: workspace.pathname,
  });

  for (const record of o) {
    const fileName = record.filename;
    const pathSource = new URL(fileName, workspace);
    const pathTarget = new URL(fileName, packsFolders);
    await fs.copyFile(pathSource, pathTarget);
    await fs.rm(pathSource);

    yield { target: pathTarget, detail: record as Detail };
  }
};
