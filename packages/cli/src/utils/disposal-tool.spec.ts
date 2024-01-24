import { test, expect } from "bun:test"
import { createContext, createContextAsync } from "./disposal-tool"

test("create context", () => {
    let called = false
    const usingObject = {
        [Symbol.dispose]() {
            called = true
        }
    }

    createContext(({ using }) => {
        const obj = using(usingObject)
    })

    expect(called).toBeTrue()
})

test("create context async", async () => {
    let called = false
    const usingObject = {
        async [Symbol.asyncDispose]() {
            called = true
        }
    }

    await createContextAsync(async ({ using }) => {
        const obj = using(usingObject)
    })

    expect(called).toBeTrue()
})
