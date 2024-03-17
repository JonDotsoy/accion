import { relative } from "path";
import { pathToFileURL } from "url";
import * as ts from "typescript";
import { glob } from "glob";

const entrypoints = [
  new URL("../src/job.ts", import.meta.url).pathname,
  new URL("../src/manager.ts", import.meta.url).pathname,
  new URL("../src/expose.ts", import.meta.url).pathname,
];

const entrypointsTs = glob.sync("**/*.ts", {
  cwd: new URL("../src/", import.meta.url).pathname,
  ignore: "**/*.d.ts",
  absolute: true,
});

const tsconfigLocation = new URL("../tsconfig.types.json", import.meta.url)
  .pathname;

const e = ts.readConfigFile(tsconfigLocation, ts.sys.readFile);
const tsconfig = ts.parseJsonConfigFileContent(
  e.config,
  ts.sys,
  new URL("../", import.meta.url).pathname,
).options;

const relativeUrl = (url: URL) => {
  const e = (s: string) => (s.startsWith(".") ? s : `./${s}`);
  return e(relative(new URL("../", import.meta.url).pathname, url.pathname));
};

for (const entrypoint of entrypoints) {
  const reports = await Bun.build({
    entrypoints: [entrypoint],
    outdir: new URL("../src/", import.meta.url).pathname,
    target: "node",
    format: "esm",
  });

  reports.outputs.forEach((output) =>
    console.log(
      `${output.hash} ${relativeUrl(pathToFileURL(output.path))} ${output.size}b`,
    ),
  );
}

const program = ts.createProgram(entrypointsTs, tsconfig);

const emitResult = program.emit();

let allDiagnostics = ts
  .getPreEmitDiagnostics(program)
  .concat(emitResult.diagnostics);

allDiagnostics.forEach((diagnostic) => {
  console.log(
    `${typeof diagnostic.messageText === "object" && diagnostic.messageText !== null ? diagnostic.messageText.messageText : diagnostic.messageText}: ${diagnostic.file?.fileName}`,
  );
});

console.log(`Success TSD compiled`);
