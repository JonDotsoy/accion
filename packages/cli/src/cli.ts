import { command, flag, flags, isBooleanAt, restArgumentsAt } from "@jondotsoy/flags"
import execCmd from "./cmds/execCmd"

type Options = {
    execArgs: string[],
    showHelp: boolean
}

const { execArgs, showHelp } = flags<Options>(process.argv.slice(2), {}, [
    [flag('-h', '--help'), isBooleanAt('showHelp')],
    [command('exec'), restArgumentsAt('execArgs')],
]);

const helpMessage = `
Usage: accion exec utility [argument ...]
`.trim();

const main = async () => {
    if (execArgs) return execCmd(execArgs)
    return console.log(helpMessage)
}

await main()
