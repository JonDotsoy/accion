import React, { useEffect, useRef, type FC } from "react"
import { useStore } from "@nanostores/react"
import { jobStore } from "../stores/jobs-store"
import { CheckCircle } from "./icons/check-circle"
import { XCircle } from "./icons/x-circle"
import { EllipsisHorizontalCircle } from "./icons/ellipsis-horizontal-circle"
import { ArrowPath } from "./icons/arrow-path"
import { menuJobsJonIdFocus } from "../stores/menu-jobs-job-id-focus"
import { LabelJob } from "./label-job"
import type { Job } from "../interfaces/Job"
import classNames from "classnames"

export const LiMenuJobs: FC<{ job: Job }> = ({ job }) => {
    const liRef = useRef<HTMLLIElement>(null)
    const jobIdFocus = useStore(menuJobsJonIdFocus);

    useEffect(() => {
        const li = liRef.current
        if (li) {
            const h = () => {
                menuJobsJonIdFocus.set(job.id)
            }
            const hleave = () => {
                menuJobsJonIdFocus.set(null)
            }
            li.addEventListener('mouseover', h)
            li.addEventListener('mouseleave', hleave)
            return () => {
                li.removeEventListener('mouseover', h)
                li.removeEventListener('mouseleave', hleave)
            }
        }
    }, [liRef.current])

    return <li ref={liRef} key={job.id} className={classNames(
        "transition-all",
        "hover:bg-gray-200",
        "rounded-md group",
        { "bg-gray-200": jobIdFocus === job.id },
    )}>
        <LabelJob job={job} enableReload></LabelJob>
    </li>
}

export const MenuJobs = () => {
    const jobs = useStore(jobStore)

    return <>
        <ul className="space-y-1">
            {jobs.map(job => <LiMenuJobs key={job.id} job={job}></LiMenuJobs>)}
        </ul>
    </>
}