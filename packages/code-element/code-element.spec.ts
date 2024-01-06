import { expect, test } from "bun:test"
import { CodeElement, VariableDeclaration, Import, ImportDefaultSpecifier, ImportSource, ImportSpecifier, ImportSpecifiers, NewExpression, Number, Identifier, ImportNamespaceSpecifier, MemberExpression } from "./code-element"

test("create elements", () => {
    expect(
        new VariableDeclaration(
            new Identifier('foo'),
            new Number(212),
        ).toString()
    ).toEqual(`const foo = 212;`)

    expect(
        new Import(
            new ImportSource("foo"),
        ).toString()
    ).toEqual(`import "foo";`)

    expect(
        new Import(
            new ImportSource("foo"),
            new ImportDefaultSpecifier(new Identifier("biz"))
        ).toString()
    ).toEqual(`import biz from "foo";`)

    expect(
        new Import(
            new ImportSource("foo"),
            new ImportSpecifiers([new ImportSpecifier(new Identifier('biz'))])
        ).toString()
    ).toEqual(`import { biz } from "foo";`)

    expect(
        new Import(
            new ImportSource("foo"),
            new ImportSpecifiers([
                new ImportSpecifier(new Identifier('biz'), new Identifier('baz'))
            ])
        ).toString()
    ).toEqual(`import { biz as baz } from "foo";`)

    expect(
        new Import(
            new ImportSource("foo"),
            new ImportSpecifiers([
                new ImportSpecifier(new Identifier('biz'), new Identifier('baz')),
                new ImportSpecifier(new Identifier('taz'))
            ])
        ).toString()
    ).toEqual(`import { biz as baz, taz } from "foo";`)

    expect((
        new Import(
            new ImportSource("foo"),
            new ImportNamespaceSpecifier(new Identifier('taz'))
        )
    ).toString()).toEqual(`import * as taz from "foo";`)

    expect(
        new NewExpression(
            new Identifier("Foo"),
        ).toString()
    ).toEqual(`new Foo()`)

    expect(
        new VariableDeclaration(
            new Identifier("foo"),
            new NewExpression(
                new Identifier("Bar"),
            )
        ).toString()
    ).toEqual(`const foo = new Bar();`)

    expect((
        new NewExpression(
            new Identifier("Foo"),
            [
                new Identifier("bar"),
                new Identifier("biz"),
            ],
        )
    ).toString()).toEqual(`new Foo(bar, biz)`)

    expect((
        new MemberExpression(
            new Identifier("foo"),
            new Identifier("biz"),
        )
    ).toString()).toEqual(`foo.biz`)

    expect((
        new MemberExpression(
            new Identifier("foo"),
            new Identifier("biz"),
        )
    ).toString()).toEqual(`foo.biz(1, 2)`)
})