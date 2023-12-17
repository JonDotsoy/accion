import { Manager } from "accion/manager"
import { Expose } from "accion/expose"
import * as jobs from "./jobs.js"
const jobsMap = new Set()

for (const job of Object.values(jobs)) {
    if (typeof job === 'object' && job !== null && typeof job.id === 'string' && typeof job.cb === 'function') {
        jobsMap.add(job)
    }
}

const manager = Manager.create(...jobsMap)

const expose = new Expose(manager, { verbose: true })

expose.listen()
