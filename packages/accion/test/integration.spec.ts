import { test, beforeAll } from "bun:test";
import * as UtilsNodeCLI from "./utils/node_cli";
import * as UtilsPackage from "./utils/package";

let nodeBins: UtilsNodeCLI.NodeBins | null = await UtilsNodeCLI.getNodePath();

const t = test.if(nodeBins !== null);

beforeAll(async () => {
  if (nodeBins) {
    const packs = await Array.fromAsync(
      UtilsPackage.getPack(nodeBins, new URL("../", import.meta.url)),
    );

    for (const pack of packs) {
      console.log("🚀 ~ beforeAll ~ pack.detail:", pack.detail.files);
    }
  }
});

t("e2e install package with node", () => {});
