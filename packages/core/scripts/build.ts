import { relative } from "path"
import { pathToFileURL } from "url"
import * as ts from "typescript"
import * as JSON5 from "json5"

const tsconfigLocation = new URL("../tsconfig.types.json", import.meta.url).pathname;

const e = ts.readConfigFile(tsconfigLocation, ts.sys.readFile)
const tsconfig = ts.parseJsonConfigFileContent(e.config, ts.sys, new URL("../", import.meta.url).pathname).options

const relativeUrl = (url: URL) => {
    const e = (s: string) => s.startsWith('.') ? s : `./${s}`
    return e(relative(new URL("../", import.meta.url).pathname, url.pathname))
}

const entrypoints = [
    new URL("../src/job.ts", import.meta.url).pathname,
    new URL("../src/manager.ts", import.meta.url).pathname,
    new URL("../src/expose.ts", import.meta.url).pathname,
]

const reports = await Bun.build({
    entrypoints,
    outdir: new URL("../src/", import.meta.url).pathname,
    target: 'node',
    format: 'esm',
    // sourcemap: "inline",
})

reports.outputs.forEach(output => console.log(`${output.hash} ${relativeUrl(pathToFileURL(output.path))} ${output.size}b`))

const program = ts.createProgram(entrypoints, tsconfig)

const emitResult = program.emit(undefined, undefined, undefined, true)

let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

allDiagnostics.forEach(diagnostic => {
    console.log(`${diagnostic.messageText} ${diagnostic.file?.fileName}`)
})
