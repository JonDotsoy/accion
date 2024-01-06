type template = (body: string) => `\u001b[${number}m${string}\u001b[${number}m`

const colorsCodes = {
    reset: [0, 0],

    bold: [1, 22],
    dim: [2, 22],
    italic: [3, 23],
    underline: [4, 24],
    inverse: [7, 27],
    hidden: [8, 28],
    strikethrough: [9, 29],

    black: [30, 39],
    red: [31, 39],
    green: [32, 39],
    yellow: [33, 39],
    blue: [34, 39],
    magenta: [35, 39],
    cyan: [36, 39],
    white: [37, 39],
    gray: [90, 39],
    grey: [90, 39],

    brightRed: [91, 39],
    brightGreen: [92, 39],
    brightYellow: [93, 39],
    brightBlue: [94, 39],
    brightMagenta: [95, 39],
    brightCyan: [96, 39],
    brightWhite: [97, 39],

    bgBlack: [40, 49],
    bgRed: [41, 49],
    bgGreen: [42, 49],
    bgYellow: [43, 49],
    bgBlue: [44, 49],
    bgMagenta: [45, 49],
    bgCyan: [46, 49],
    bgWhite: [47, 49],
    bgGray: [100, 49],
    bgGrey: [100, 49],

    bgBrightRed: [101, 49],
    bgBrightGreen: [102, 49],
    bgBrightYellow: [103, 49],
    bgBrightBlue: [104, 49],
    bgBrightMagenta: [105, 49],
    bgBrightCyan: [106, 49],
    bgBrightWhite: [107, 49],

    // legacy styles for colors pre v1.0.0
    blackBG: [40, 49],
    redBG: [41, 49],
    greenBG: [42, 49],
    yellowBG: [43, 49],
    blueBG: [44, 49],
    magentaBG: [45, 49],
    cyanBG: [46, 49],
    whiteBG: [47, 49],
} as const;

const colors = Object.fromEntries(Array.from(Object.entries(colorsCodes), ([colorName, [open, close]]) => [colorName, (body: string) => `\u001b[${open}m${body}\u001b[${close}m`])) as Record<keyof typeof colorsCodes, template>

const schemaColorsRandom = [
    colors['red'],
    colors['green'],
    colors['yellow'],
    colors['blue'],
    colors['magenta'],
    colors['cyan'],
].sort(() => Math.random() > 0.5 ? 1 : -1)

const indexLogRef = { current: 0 }

const minuteFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'minute', unitDisplay: 'narrow' })
const secondFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'second', unitDisplay: 'narrow' })
const millisecondFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'millisecond', unitDisplay: 'narrow' })

const durationFormat = (durationMillisecond: number) => {
    if (durationMillisecond < 1000) return millisecondFormat.format(durationMillisecond)
    if (durationMillisecond < 60000) return secondFormat.format(durationMillisecond / 1000)
    return minuteFormat.format(durationMillisecond / 60000)
}

export const makeIsEnabled = (debugExpression?: string) => {
    const rules = debugExpression?.split(',')
        .filter(chunk => chunk.length)
        .map(chunk => `^${chunk.replace(/\*|\W/g, (char) => char === '*' ? '.*?' : `\\${char}`)}$`)
        .map(chunk => new RegExp(chunk))
        ?? []

    return (namespace: string) => {
        if (!rules.length) return false
        return rules.some(exp => exp.test(namespace))
    }
}

const globalIsEnabled = makeIsEnabled(process.env.DEBUG ?? '')

export const debug = (namespace: string) => {
    let lastCall = Date.now()
    const indexLog = indexLogRef.current++
    const schemaColor = schemaColorsRandom[indexLog % schemaColorsRandom.length]
    const log = (message: string) => {
        const l = Date.now() - lastCall
        lastCall = Date.now()
        if (log.enabled) {
            const latency = `${l >= 0 ? '+' : '-'}${durationFormat(l)}`
            console.log(`${schemaColor(namespace)} ${message} ${schemaColor(latency)}`)
        }
    }
    log.namespace = namespace
    log.enabled = globalIsEnabled(namespace)
    log.extend = (childNamespace: string = '') => debug(`${namespace}${childNamespace}`)
    return log
}