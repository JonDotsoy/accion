import { test, expect } from "bun:test"
import { job } from "../src/job.ts"
import { Manager, State } from "../src/manager.ts"
import { JobContext } from "../src/interfaces/job.ts"
import { StorageService } from "../src/interfaces/storage-service.ts"

test('priority plan', () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(
        job1,
        job2,
        job3,
        job4,
        job5,
        job6,
        job7,
        job8,
    )

    expect(manager.toFlowchart()).toMatchSnapshot()
})

test("expected error if is repeating the id", () => {
    const job1 = job("job1", () => 1)
    const job2 = job("job1", () => 1)

    expect(() => {
        Manager.create(job1, job2)
    }).toThrow()
})

test("export manager states", () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(
        job1,
        job2,
        job3,
        job4,
        job5,
        job6,
        job7,
        job8,
    )

    expect(JSON.stringify(manager)).toMatchSnapshot()
})

test("from json", () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const raw = {
        "indexes": ["1", "2", "3", "4", "5", "6", "7", "8"],
        "relations": [["1", "2"], ["1", "3"], ["2", "3"], ["3", "4"], ["5", "6"], ["2", "6"], ["7", "8"]],
        "jobStates": { "2": { state: 'completed' } }
    }

    const manager = Manager.fromJson(
        raw,
        job1,
        job2,
        job3,
        job4,
        job5,
        job6,
        job7,
        job8,
    )

    expect(manager.stateOfJob(job2)).not.toBeNull()
})

test("call next job", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const [nextJob1] = await Array.fromAsync(manager.nextJobs())
    expect(nextJob1).not.toBeNull()
    expect(nextJob1).not.toBeUndefined()
    expect(nextJob1?.id).toEqual('1')
})

test("change state of job", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const [nextJob1] = await Array.fromAsync(manager.nextJobs())
    manager.updateState(nextJob1!, State.Success)
})

test("change state of job", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    manager.updateState(job1, State.Success)
    manager.updateState(job2, State.Success)

    const nextJob3 = manager.nextJobs().next().value
    expect(nextJob3.id).toEqual('3')
})

test("each jobs", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const ids: any[] = []

    for await (const job of manager) {
        const jobId = job.id
        ids.push(jobId)
    }

    expect(ids).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"])
})

test("reset job", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const ids: any[] = []

    manager.updateState(job1, State.Success)
    manager.updateState(job2, State.Success)
    const nextJob1 = manager.nextJobs().next().value ?? null
    expect(nextJob1?.id).toEqual('3')
    manager.resetState(job2)
    const nextJob2 = manager.nextJobs().next().value ?? null
    expect(nextJob2?.id).toEqual('2')
})

test("parallel jobs", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const ids: any[] = []

    for await (const job of manager) {
        const jobId = job.id
        ids.push(jobId)
    }

    expect(ids).toEqual(["1", "2", "3", "4", "5", "6", "7", "8"])
})

class Queue<T> {
    private dataSet = new Set<T>()
    private looks = new Set<T>()
    private subStates = new Set<{ active: boolean }>()

    push(data: T) {
        this.dataSet.add(data)
    }

    close() {
        for (const subState of this.subStates) {
            subState.active = false
        }
    }

    subscribe(cb: (data: T) => Promise<void>) {
        const subState = { active: true }
        this.subStates.add(subState)
        const startLoop = async () => {
            while (subState.active) {
                for (const data of this.dataSet) {
                    const isFree = !this.looks.has(data)
                    if (isFree) {
                        this.looks.add(data)
                        await cb(data)
                        this.looks.delete(data)
                        this.dataSet.delete(data)
                        break
                    }
                }

                await new Promise(resolve => setTimeout(resolve, 1))
            }
        }
        const _promise = startLoop()
    }
}

test("strategy queue job", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, () => 1)
    const job3 = job("3", { input: { job1, job2 } }, () => 1)
    const job4 = job("4", { input: { job3 } }, () => 1)
    const job5 = job("5", () => 1)
    const job6 = job("6", { input: { job5, job2 } }, () => 1)
    const job7 = job("7", () => 1)
    const job8 = job("8", { input: { job7 } }, () => 1)

    const ids = new Set<string>()

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const queue = new Queue<JobContext<any>>()

    const cb = async (job: JobContext<any>) => {
        ids.add(job.id)
        if (job.id === '1') await new Promise(r => setTimeout(r, 50))
        manager.updateState(job, State.Success)
        manager.childrenOfJob(job).forEach(job => queue.push(job))
    }

    queue.subscribe(cb)
    queue.subscribe(cb)

    Array.from(manager.nextJobs()).forEach(job => queue.push(job))

    await new Promise(r => setTimeout(r, 100))
    expect(Array.from(ids)).toEqual(["1", "5", "7", "6", "8", "2", "3", "4"])

    queue.close()
})

test("sync multi manager", async () => {
    const makeManager = () => {
        const job1 = job("1", () => 1)
        const job2 = job("2", { input: { job1 } }, () => 1)
        const job3 = job("3", { input: { job1, job2 } }, () => 1)
        const job4 = job("4", { input: { job3 } }, () => 1)
        const job5 = job("5", () => 1)
        const job6 = job("6", { input: { job5, job2 } }, () => 1)
        const job7 = job("7", () => 1)
        const job8 = job("8", { input: { job7 } }, () => 1)

        const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

        return { manager, job1, job2, job3, job4, job5, job6, job7, job8 }
    }

    const manager1 = makeManager()
    const manager2 = makeManager()

    Manager.linkManager(manager1.manager, manager2.manager)

    manager1.manager.updateState(manager1.job1, State.Success)

    expect(manager1.manager.stateOfJob(manager1.job1)).toEqual(manager2.manager.stateOfJob(manager2.job1))
})

test('calling job', async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, ({ job1 }) => job1 + 2)
    const job3 = job("3", { input: { job1, job2 } }, () => 3)
    const job4 = job("4", { input: { job3 } }, () => 4)
    const job5 = job("5", () => 5)
    const job6 = job("6", { input: { job5, job2 } }, () => 6)
    const job7 = job("7", () => 7)
    const job8 = job("8", { input: { job7 } }, () => 8)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const resultJob1 = await manager.runJob(job1)
    expect(resultJob1).toEqual(1)
    const resultJob2 = await manager.runJob(job2)
    expect(resultJob2).toEqual(3)
})

test('calling job failed by dependencies', async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, ({ job1 }) => job1 + 2)
    const job3 = job("3", { input: { job1, job2 } }, ({ job1, job2 }) => ({ job1, job2, job: 3 }))

    const manager = Manager.create(job1, job2, job3)

    await expect(manager.runJob(job3)).rejects.toBeInstanceOf(Error)
})

test('calling job', async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, ({ job1 }) => job1 + 2)
    const job3 = job("3", { input: { job1, job2 } }, ({ job1, job2 }) => job1 + job2 + 3)
    const job4 = job("4", { input: { job3 } }, ({ job3 }) => job3 + 4)
    const job5 = job("5", () => 5)
    const job6 = job("6", { input: { job5, job2 } }, ({ job5, job2 }) => job5 + job2 + 6)
    const job7 = job("7", () => 7)
    const job8 = job("8", { input: { job7 } }, ({ job7 }) => job7 + 8)

    const manager = Manager.create(job1, job2, job3, job4, job5, job6, job7, job8)

    const outputs = new Set<number>()

    for await (const job of manager) {
        const res = await manager.runJob(job)
        outputs.add(res)
    }

    expect(Array.from(outputs)).toEqual([1, 3, 7, 11, 5, 14, 15])
})

test("custom storage service", async () => {
    const job1 = job("1", () => 1)
    const job2 = job("2", { input: { job1 } }, ({ job1 }) => new Response(`[${job1}]`))
    const job3 = job("3", { input: { job1, job2 } }, async ({ job1, job2 }) => `${job1} + ${await job2.clone().text()} + ${3}`)
    const storage: StorageService = new Map() as unknown as StorageService

    const manager = Manager.create(job1, job2, job3)
    Manager.putStorageService(manager, storage)

    for await (const job of manager) {
        await manager.runJob(job)
    }

    expect(storage).toMatchSnapshot()
})
