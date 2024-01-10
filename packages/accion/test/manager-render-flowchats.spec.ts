import { expect, test } from "bun:test";
import { Manager, State } from "../src/manager";
import { job } from "../src/job";

test("render flowcharts", () => {
    const job1 = job("job1", () => { })
    const job2 = job("job2", { input: { job1 } }, () => { })
    const job3 = job("job3", { input: { job1, job2 } }, () => { })

    const manager = Manager.create(job1, job2, job3)

    expect(manager.toFlowchart()).toMatchSnapshot()
})

test("render flowcharts and format the node id", () => {
    const job1 = job("job1", () => { })
    const job2 = job("job2", { input: { job1 } }, () => { })
    const job3 = job("job3", { input: { job1, job2 } }, () => { })

    const manager = Manager.create(job1, job2, job3)

    expect(manager.toFlowchart({ formatNodeId: nodeId => `__${nodeId}__` })).toMatchSnapshot()
})

test("render flowcharts and format the node label", async () => {
    const job1 = job("job 1", () => { })
    const job2 = job("job \"2", { input: { job1 } }, () => { })
    const job3 = job("job 3", { input: { job1, job2 } }, () => { })

    const manager = Manager.create(job1, job2, job3)

    await manager.runJob(job1)

    await manager.updateState(job2, State.Running)

    const emojiState = (state?: State) => {
        if (state === State.Success) return `✅`
        if (state === State.Running) return `⚙️`
        if (state === State.Failed) return `❌`
        return `🟡`
    }

    expect(manager.toFlowchart({
        formatNodeLabel: (nodeId, job) => `${nodeId}["${emojiState(manager.stateOfJob(job)?.state)} ${job.id.replace(/[\#\"]/g, code => `#${code.charCodeAt(0)};`)}"]`
    })).toMatchSnapshot()
})
