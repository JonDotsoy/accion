import { debug } from "./debug.js";
import * as child_process from "child_process";
import { promiseWithResolvers } from "./promise-with-resolvers.js";

type Options = {
    returnOutput?: boolean;
    silence?: boolean;
    verbose?: boolean;
    shell?: string;
};

export const exec = async (
    cmd: string,
    ...args: [args?: string[], options?: Options] | [options?: Options]
) => {
    const log = debug("exec");
    let argOptions: Options = {};
    let cmdArgs: null | string[] = null;

    for (const arg of args) {
        if (Array.isArray(arg)) {
            cmdArgs = arg;
            continue;
        }
        if (typeof arg === "object" && arg !== null) {
            argOptions = arg;
            continue;
        }
    }

    const omitReturnOutput = argOptions?.returnOutput === false;
    const verbose = argOptions?.verbose === true || log.enabled;
    const shell = argOptions?.shell ?? "sh";
    const printStdoutAndStderr = verbose
        ? true
        : argOptions.silence
          ? false
          : true;

    if (verbose) log.enabled = true;

    const { resolve, reject, promise } = promiseWithResolvers();

    log(`Run ${cmd}${cmdArgs ? ` ${cmdArgs.join(" ")}` : ""}`);

    const matrixCmd = cmdArgs
        ? { cmd, cmdArgs }
        : { cmd: shell, cmdArgs: ["-c", cmd] };

    const subprocess = child_process.spawn(
        matrixCmd.cmd,
        matrixCmd.cmdArgs ?? [],
        {
            stdio: "pipe",
            detached: false,
            shell: false,
        },
    );

    subprocess.addListener("error", (error) => reject(error));
    subprocess.addListener("exit", (code) => resolve(code));

    let outputBuff = new Uint8Array([]);

    subprocess.stdout.addListener("data", (data) => {
        if (printStdoutAndStderr) process.stdout.write(data);
        if (!omitReturnOutput) {
            outputBuff = new Uint8Array([...outputBuff, ...data]);
        }
    });

    subprocess.stderr.addListener("data", (data) => {
        if (printStdoutAndStderr) process.stdout.write(data);
    });

    await promise;

    const text = () => new TextDecoder().decode(outputBuff);
    const json = () => JSON.parse(text());

    if (subprocess.exitCode !== 0) throw new Error(`Exists status`);

    return { exitCode: subprocess.exitCode, text, json };
};
