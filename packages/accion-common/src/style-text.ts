export type TextStyled = `\x1b[${number}m${string}\x1b[${number}m`

export type template = (
    body: string,
) => TextStyled;

export const colorsCodes = {
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

    redBright: [91, 39],
    greenBright: [92, 39],
    yellowBright: [93, 39],
    blueBright: [94, 39],
    magentaBright: [95, 39],
    cyanBright: [96, 39],
    whiteBright: [97, 39],

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

    bgRedBright: [101, 49],
    bgGreenBright: [102, 49],
    bgYellowBright: [103, 49],
    bgBlueBright: [104, 49],
    bgMagentaBright: [105, 49],
    bgCyanBright: [106, 49],
    bgWhiteBright: [107, 49],
} as const;

export type Style = keyof typeof colorsCodes

const isStyle = (key: string): key is keyof typeof colorsCodes => Reflect.has(colorsCodes, key)

export const styleTextSimple = (style: Style, body: string) => {
    if (isStyle(style)) {
        const [open, close] = colorsCodes[style];
        const nextBody: TextStyled = `\x1b[${open}m${body}\x1b[${close}m`
        return nextBody
    }
    return body
}

export const styleText = (style: Style | Style[], body: string) => {
    const styles = Array.isArray(style) ? style : [style];
    return styles.reduce((accum, style): string => styleTextSimple(style, accum), body)
}