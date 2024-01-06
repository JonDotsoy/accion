import { expect, test } from "bun:test"
import { makeIsEnabled, debug } from "./debug.ts"

test("tests", () => {
    expect(makeIsEnabled()('foo')).toBeFalse()
    expect(makeIsEnabled('')('foo')).toBeFalse()
    expect(makeIsEnabled('biz')('foo')).toBeFalse()
    expect(makeIsEnabled('foo')('foo')).toBeTrue()
    expect(makeIsEnabled('foo')('foo2')).toBeFalse()
    expect(makeIsEnabled('foo*')('foo')).toBeTrue()
    expect(makeIsEnabled('foo*')('foo:asd')).toBeTrue()
    expect(makeIsEnabled('foo*')('foo:asd:asd')).toBeTrue()
    expect(makeIsEnabled('foo*')('fooasda')).toBeTrue()
})

test("debug", () => {
    const log = debug('foo')
    log('foo')
})

test("debug extend", () => {
    const log = debug('foo').extend(":biz")
    log('foo')
})
