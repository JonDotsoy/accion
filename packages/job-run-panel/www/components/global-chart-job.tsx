import { useStore } from "@nanostores/react"
import { jobStore } from "../stores/jobs-store"
import { ChartView } from "./chart-view"
import { useMemo } from "react"
import { menuJobsJonIdFocus } from "../stores/menu-jobs-job-id-focus"

export const GlobalChartJob = () => {
    const jobs = useStore(jobStore)
    const jobIdFocus = useStore(menuJobsJonIdFocus)

    const relations = useMemo(() => jobs.flatMap(job => job.needs?.map(need => ({ source: need, target: job.id })) ?? []), [jobs])

    return <ChartView chart={{ jobs, relations: relations }} autoFocus={jobIdFocus ?? undefined}></ChartView>
}