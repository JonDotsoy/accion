import { atom } from "nanostores"
import { type Job } from "../interfaces/Job.ts"

export const jobStore = atom<Job[]>([])
