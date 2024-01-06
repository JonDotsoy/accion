#!/usr/bin/env node
import { any, flag, flags, restArgumentsAt, isStringAt } from "@jondotsoy/flags"
import { relative } from "path"
import { exposeTemplate } from "./templates/expose-template"
import { mkdir, writeFile } from "fs/promises"
import { debug } from "accion-common/lib/debug"
import { exec } from "accion-common/lib/exec"

const log = debug('accion-bin')

const getCacheFolder = async () => {
    const npmRootSubprocess = await exec('npm root', { silence: true })
    const nodeModulesRelativePath = npmRootSubprocess.text().trim()

    if (!nodeModulesRelativePath) {
        throw new Error(`Indeterminate node_module path`)
    }

    const nodeModulesUrl = new URL(`${nodeModulesRelativePath}/`, 'file:///')
    return new URL("./.cache/", nodeModulesUrl)
}


type Options = {
    outAction: string,
    _: string[]
}

const opts = flags<Options>(process.argv.slice(2), { _: [] }, [
    [flag('-d'), isStringAt('outAction')],
    [any(), restArgumentsAt('_')],
])

const fileJobs = opts._?.at(0)
const destiny = opts.outAction ?? new URL('./.accion/expose.mjs', await getCacheFolder())

if (!fileJobs) throw new Error('missing job file argument')
const jobUrl = new URL(fileJobs, new URL(`${process.cwd()}/`, `file:////`))
const destinyUrl = new URL(destiny, new URL(`${process.cwd()}/`, `file:////`))

log(`Write ${destinyUrl} file`)

const o = relative(new URL("./", destinyUrl).pathname, jobUrl.pathname)

const out = exposeTemplate({ destinationPath: o, port: 6544 })
await mkdir(new URL("./", destinyUrl), { recursive: true })
await writeFile(destiny, out)
// console.log("🚀 ~ file: bin.ts:28 ~ out:", out)

await exec('node', [destinyUrl.pathname])
