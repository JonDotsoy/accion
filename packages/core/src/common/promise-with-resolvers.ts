export const promiseWithResolvers = <T>() => {
    let resolve = (_value: T) => { }
    let reject = (_reason: any) => { }

    const promise = new Promise<T>((innerResolve, innerReject) => {
        resolve = innerResolve
        reject = innerReject
    })

    return {
        promise,
        resolve,
        reject,
    }
}