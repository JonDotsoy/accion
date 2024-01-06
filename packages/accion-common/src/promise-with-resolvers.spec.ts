import { expect, test } from "bun:test"
import { promiseWithResolvers } from "./promise-with-resolvers.ts"

test("call resolver", async () => {
    const { promise, resolve, reject } = promiseWithResolvers()

    resolve(3)

    await expect(promise).resolves.toEqual(3)
})
