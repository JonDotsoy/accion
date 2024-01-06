import { Manager, State } from "../manager.ts";

export const status = (manager: Manager) => {
    return new Response(JSON.stringify({
        ok: true,
        manager,
    }))
}

export const flowchart = (manager: Manager) => {
    return new Response(
        manager.toFlowchart()
    )
}

export const callingJob = async (manager: Manager, jobId: string) => {
    const job = manager.jobById(jobId)
    await manager.runJob(job)
    await manager.updateState(job, State.Success)
    return new Response('', { status: 201 })
}

export const router = async (url: URL, request: Request, manager: Manager): Promise<Response | null> => {
    if (request.method === 'GET' && url.pathname === '/status') return await status(manager)
    if (request.method === 'GET' && url.pathname === '/flowchart') return await flowchart(manager)

    let matchURLCallingJob = /^\/job\/(?<jobId>.+)\/run$/.exec(url.pathname)
    if (request.method === 'POST' && matchURLCallingJob !== null) return await callingJob(manager, matchURLCallingJob.groups!.jobId)

    return null
}
