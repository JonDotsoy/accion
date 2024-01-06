export const exposeTemplate = ({ destinationPath, port, host = '127.0.0.1' }: { destinationPath: string, port: number, host?: string }) => `
import { Manager } from "accion/manager"
import { Expose } from "accion/expose"
import * as jobs from ${JSON.stringify(destinationPath)}

const jobsMap = new Set()

for (const job of Object.values(jobs)) {
    if (typeof job === 'object' && job !== null && typeof job.id === 'string' && typeof job.cb === 'function') {
        jobsMap.add(job)
    }
}

const manager = Manager.create(...jobsMap)

const openExpose = async () => {
    const expose = new Expose(
        manager,
        {
            verbose: true
        }
    )
    await expose.listen(${port}, ${JSON.stringify(host)});
}

openExpose()
    .catch(console.error);
`
