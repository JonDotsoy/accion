import { expect, test } from "bun:test";
import { promiseWithResolvers } from "../src/promise-with-resolvers";

test("call resolver", async () => {
    const { promise, resolve, reject } = promiseWithResolvers();

    resolve(3);

    await expect(promise).resolves.toEqual(3);
});
