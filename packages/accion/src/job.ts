export type { JobContext, JobReturn, JobArgs, JobCb } from "./interfaces/job.ts"
import type { JobContext, JobReturn, JobArgs, JobCb } from "./interfaces/job.ts"

const isCb = (value: unknown): value is (() => JobCb<any>) => typeof value === 'function'

export const job = <R extends JobReturn, I extends Record<string, JobContext<any>>>(
    ...args: JobArgs<R, I>
): JobContext<R> => {
    let id: null | string = null
    let description: null | string = null
    let cb: null | (() => JobCb<R>) = null
    let input: null | I = null

    for (const arg of args) {
        if (typeof arg === 'string') id = arg
        if (isCb(arg)) cb = arg
        if (typeof arg === 'object' && arg !== null) {
            id = id ?? arg.id ?? null
            description = arg.description ?? null
            input = arg.input ?? null
        }
    }

    if (id === null) throw new Error(`Missing id`)
    if (cb === null) throw new Error(`Missing cb function`)

    return {
        id,
        description,
        input,
        cb,
    }
}
