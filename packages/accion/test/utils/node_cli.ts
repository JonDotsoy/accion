import { execToText } from "./exec";

export type NodeBins = {
  node: { version: string; path: string };
  npm: { version: string; path: string };
};

const getNodePathByEnv = async (): Promise<null | NodeBins> => {
  const NODE_BIN_PATH = process.env.NODE_BIN_PATH;
  if (!NODE_BIN_PATH) return null;
  if (!URL.canParse(NODE_BIN_PATH, "file:///"))
    throw new Error(`Cannot understand ${NODE_BIN_PATH} path`);
  const nodeBinPath = new URL(NODE_BIN_PATH, "file:///");
  const nodeBin = new URL("node", nodeBinPath);
  const npmBin = new URL("npm", nodeBinPath);
  return {
    node: {
      version: (
        await execToText({ cmd: [nodeBin.pathname, "--version"] })
      ).trim(),
      path: nodeBin.pathname,
    },
    npm: {
      version: (
        await execToText({ cmd: [npmBin.pathname, "--version"] })
      ).trim(),
      path: npmBin.pathname,
    },
  };
};

const getNodePathByShell = async (): Promise<null | NodeBins> => {
  const nodeBinPath = await execToText({ cmd: ["which", "node"] });
  const npmBinPath = await execToText({ cmd: ["which", "npm"] });
  const nodeBin = new URL(nodeBinPath, "file:///");
  const npmBin = new URL(npmBinPath, "file:///");
  return {
    node: {
      version: (
        await execToText({ cmd: [nodeBin.pathname, "--version"] })
      ).trim(),
      path: nodeBin.pathname,
    },
    npm: {
      version: (
        await execToText({ cmd: [npmBin.pathname, "--version"] })
      ).trim(),
      path: npmBin.pathname,
    },
  };
};

export const getNodePath = async () =>
  (await getNodePathByEnv()) ?? (await getNodePathByShell()) ?? null;
