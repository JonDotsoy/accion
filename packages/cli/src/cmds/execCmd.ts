import { spawn } from "child_process"
import { any, flag, flags, isBooleanAt, restArgumentsAt } from "@jondotsoy/flags"
import { renderFrame } from "../components/visor-ui/render-frame"
import { createContext, createContextAsync } from "../utils/disposal-tool"

const parseArgs = (args: string[]) => {
    type Option = {
        ui: boolean,
        args: string[]
    }

    const { ui, args: restArgs } = flags<Option>(args, {}, [
        [flag('--ui'), isBooleanAt('ui')],
        [any(), restArgumentsAt('args')],
    ])

    return {
        ui,
        args: restArgs,
    }
}

export default async (args: string[]) => {
    await createContextAsync(async ({ using }) => {
        const { ui, args: a = [] } = parseArgs(args);

        const server = using(renderFrame());

        if (ui) { await server.open() }

        const [command, ...commandArgs] = a;
        const { promise, resolve, reject } = Promise.withResolvers<number | null>();

        const childProcess = spawn(command, commandArgs, { stdio: 'pipe' });

        childProcess.once('close', (exitCode) => resolve(exitCode));
        childProcess.on('error', (error) => reject(error));

        childProcess.stdout.pipe(process.stdout);
        childProcess.stderr.pipe(process.stderr);
        childProcess.stdin.pipe(process.stdin);

        const exitCode = await promise;
        process.exitCode = exitCode ?? undefined;

        if (ui) await new Promise(r => {
            console.log(``)
            console.log(`Close with Ctrl+C`)
        })
    })
}