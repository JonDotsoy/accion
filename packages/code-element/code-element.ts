export abstract class CodeElement { }

export class Number extends CodeElement {
    constructor(readonly value: number) {
        super()
    }
    toString() {
        return `${this.value}`
    }
}

export class VariableDeclaration extends CodeElement {
    constructor(readonly variableName: Identifier, readonly sentence: CodeElement) {
        super()
    }

    toString() {
        return `const ${this.variableName} = ${this.sentence};`
    }
}


export class Identifier extends CodeElement {
    constructor(readonly name: string) {
        super()
        if (/\W/.test(name)) throw new Error(`Invalid variable name`)
    }
    toString() {
        return `${this.name}`
    }
}

export class Import extends CodeElement {
    constructor(readonly source: ImportSource, readonly specifier?: ImportNamespaceSpecifier | ImportDefaultSpecifier | ImportSpecifiers) { super() }
    toString() {
        if (this.specifier) return `import ${this.specifier} from ${this.source};`
        return `import ${this.source};`
    }
}

export class ImportSource extends CodeElement {
    constructor(readonly value: string) { super() }
    toString() {
        return `${JSON.stringify(this.value)}`
    }
}

export class ImportSpecifiers extends CodeElement {
    constructor(readonly identifiers: ImportSpecifier[]) { super() }
    toString() {
        return `{ ${this.identifiers.join(', ')} }`
    }
}

export class ImportSpecifier extends CodeElement {
    constructor(readonly identifier: Identifier, readonly localIdentifier?: Identifier) { super() }
    toString() {
        if (this.localIdentifier) return `${this.identifier} as ${this.localIdentifier}`
        return `${this.identifier}`
    }
}

export class ImportDefaultSpecifier extends CodeElement {
    constructor(readonly variableName: Identifier) { super() }
    toString() {
        return `${this.variableName}`
    }
}

export class NewExpression extends CodeElement {
    constructor(readonly identifier: Identifier, readonly args?: (Identifier)[]) {
        super()
    }
    toString() { return `new ${this.identifier}(${this.args?.join(', ') ?? []})` }
}

export class ImportNamespaceSpecifier extends CodeElement {
    constructor(readonly identifier: Identifier) {
        super()
    }

    toString() {
        return `* as ${this.identifier}`
    }
}

export class MemberExpression extends CodeElement {
    constructor(readonly object: Identifier, readonly property: Identifier) {
        super()
    }
    toString() {
        return `${this.object}.${this.property}`
    }
}
