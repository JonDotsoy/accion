const minuteFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'minute', unitDisplay: 'narrow' })
const secondFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'second', unitDisplay: 'narrow' })
const millisecondFormat = new Intl.NumberFormat(undefined, { style: 'unit', unit: 'millisecond', unitDisplay: 'narrow' })

const durationFormat = (durationMillisecond: number) => {
    if (durationMillisecond < 1000) return millisecondFormat.format(durationMillisecond)
    if (durationMillisecond < 60000) return secondFormat.format(durationMillisecond)
    return minuteFormat.format(durationMillisecond / 1000)
}

export const debug = (namespace: string) => {
    let lastCall = Date.now()
    const log = (message: string) => {
        if (log.enabled) {
            const l = Date.now() - lastCall
            lastCall = Date.now()
            console.log(`${namespace} ${message} ${l >= 0 ? '+' : '-'}${durationFormat(l)}`)
        }
    }
    log.namespace = namespace
    log.enabled = false
    return log
}