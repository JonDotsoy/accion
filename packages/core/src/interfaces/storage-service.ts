import { Arg } from "./arg"

export type StorageService = {
    has(key: string): Promise<boolean>
    get(key: string): Promise<Arg>
    set(key: string, value: Arg): Promise<void>
}
