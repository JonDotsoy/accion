type Control = {
    using: <T extends { [Symbol.dispose]: () => void } | { [Symbol.asyncDispose]: () => Promise<void> }>(value: T) => T
}
type CB<T> = (control: Control) => T

const isRecord = (value: unknown): value is Record<any, any> => typeof value === 'object' && value !== null
const isFunction = (value: unknown): value is ((...args: unknown[]) => unknown) => typeof value === 'function'

export const createContext = <T>(cb: CB<T>): T => {
    const finallyCalls = new Set<any>()

    const using = <R>(value: R): R => {
        if (isRecord(value) && Reflect.has(value, Symbol.dispose)) {
            finallyCalls.add(Reflect.get(value, Symbol.dispose))
        }
        return value
    }
    try {
        return cb({ using })
    } finally {
        for (const finallyCall of finallyCalls) {
            if (isFunction(finallyCall)) {
                finallyCall()
            }
        }
    }
}

export const createContextAsync = async <T>(cb: CB<Promise<T>>): Promise<T> => {
    const finallyCalls = new Set<any>()

    const using = <R>(value: R): R => {
        if (isRecord(value)) {
            if (Reflect.has(value, Symbol.dispose)) {
                finallyCalls.add(Reflect.get(value, Symbol.dispose))
            }
            if (Reflect.has(value, Symbol.asyncDispose)) {
                finallyCalls.add(Reflect.get(value, Symbol.asyncDispose))
            }
        }
        return value
    }
    try {
        return await cb({ using })
    } finally {
        for (const finallyCall of finallyCalls) {
            if (isFunction(finallyCall)) {
                await finallyCall()
            }
        }
    }
}
