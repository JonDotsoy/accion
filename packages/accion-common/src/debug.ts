import { Style, styleText } from "./style-text.js";

const schemaColorsRandom = [
    "red",
    "green",
    "yellow",
    "blue",
    "magenta",
    "cyan",
].sort(() => (Math.random() > 0.5 ? 1 : -1)) as Style[];

const indexLogRef = { current: 0 };

const minuteFormat = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: "minute",
    unitDisplay: "narrow",
});
const secondFormat = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
});
const millisecondFormat = new Intl.NumberFormat(undefined, {
    style: "unit",
    unit: "millisecond",
    unitDisplay: "narrow",
});

const durationFormat = (durationMillisecond: number) => {
    if (durationMillisecond < 1000)
        return millisecondFormat.format(durationMillisecond);
    if (durationMillisecond < 60000)
        return secondFormat.format(durationMillisecond / 1000);
    return minuteFormat.format(durationMillisecond / 60000);
};

export const makeIsEnabled = (debugExpression?: string) => {
    const rules =
        debugExpression
            ?.split(",")
            .filter((chunk) => chunk.length)
            .map(
                (chunk) =>
                    `^${chunk.replace(/\*|\W/g, (char) => (char === "*" ? ".*?" : `\\${char}`))}$`,
            )
            .map((chunk) => new RegExp(chunk)) ?? [];

    return (namespace: string) => {
        if (!rules.length) return false;
        return rules.some((exp) => exp.test(namespace));
    };
};

const globalIsEnabled = makeIsEnabled(process.env.DEBUG ?? "");

export const debug = (namespace: string) => {
    let lastCall = Date.now();
    const indexLog = indexLogRef.current++;
    const schemaColor: Style =
        schemaColorsRandom[indexLog % schemaColorsRandom.length];
    const log = (message: string) => {
        const l = Date.now() - lastCall;
        lastCall = Date.now();
        if (log.enabled) {
            const latency = `${l >= 0 ? "+" : "-"}${durationFormat(l)}`;
            console.log(
                `${styleText(schemaColor, namespace)} ${message} ${styleText(schemaColor, latency)}`,
            );
        }
    };
    log.namespace = namespace;
    log.enabled = globalIsEnabled(namespace);
    log.extend = (childNamespace: string = "") =>
        debug(`${namespace}${childNamespace}`);
    return log;
};
