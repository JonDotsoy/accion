import React, { type FC } from "react";
import type { Job } from "../interfaces/Job";
import { CheckCircle } from "./icons/check-circle";
import { XCircle } from "./icons/x-circle";
import { EllipsisHorizontalCircle } from "./icons/ellipsis-horizontal-circle";
import { menuJobsJonIdFocus } from "../stores/menu-jobs-job-id-focus";
import { ArrowPath } from "./icons/arrow-path";
import { ProgressCircle } from "./icons/progress-circle";

export const LabelJob: FC<{ job: Job, enableReload?: boolean }> = ({ job, ...props }) => {
    const enableReload = props.enableReload ?? false

    const isSuccess = job.status === 'success'
    const isFailed = job.status === 'failed'
    const isPending = job.status === 'pending'
    const isProgressing = job.status === 'progressing'
    const isReloadEnable = enableReload && (isSuccess || isFailed)

    return <>
        <div className="grid grid-cols-[auto_1fr_auto] gap-1 items-center">
            <span>
                {isSuccess && <CheckCircle className="aspect-square w-6 stroke-green-500" />}
                {isFailed && <XCircle className="aspect-square w-6 stroke-red-500" />}
                {isPending && <EllipsisHorizontalCircle className="aspect-square w-6 stroke-gray-300" />}
                {isProgressing && <ProgressCircle className="animate-spin aspect-square w-6 stroke-green-500" />}
            </span>
            <span>{job.name}</span>
            <span>
                {isReloadEnable && <button
                    onMouseOver={() => menuJobsJonIdFocus.set(job.id)}
                    onMouseLeave={() => menuJobsJonIdFocus.set(null)}
                    className="grid grid-cols-1 justify-center align-middle opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-100 rounded-md p-1 group"
                >
                    <ArrowPath className="aspect-square w-5 stroke-slate-400 hover:stroke-slate-800" />
                </button>}
            </span>
        </div>
    </>
}