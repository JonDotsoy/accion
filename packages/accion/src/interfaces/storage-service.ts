import type { Arg } from "./arg.ts"

export type StorageService = {
    has(key: string): Promise<boolean>
    get(key: string): Promise<Arg>
    set(key: string, value: Arg): Promise<void>
}
