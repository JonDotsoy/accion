const noop: (...args: any[]) => void = () => {};

export const promiseWithResolvers = <T extends any>() => {
    let resolve: (value: T) => void = noop;
    let reject: (reason: any) => void = noop;

    const promise = new Promise<T>((innerResolve, innerReject) => {
        resolve = innerResolve;
        reject = innerReject;
    });

    if (resolve === noop) throw new Error(`Cannot load resolve function`);
    if (reject === noop) throw new Error(`Cannot load reject function`);

    return {
        promise,
        resolve,
        reject,
    };
};
