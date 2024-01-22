import type { APIRoute } from "astro";
import * as YAML from "yaml";
import type { Job } from "../../interfaces/Job";
import { atom, deepMap } from "nanostores";
import base64 from "base64-js";
import { createHandlerJobs } from "../../../src/create-handler-jobs";

const jobStore = atom<Job[]>([]);
jobStore.set([
  { id: "1", status: "pending", name: "job 1" },
  { id: "2", status: "pending", name: "job 2", needs: ["1"] },
  { id: "3", status: "pending", name: "job 3", needs: ["1", "2"] },
  { id: "4", status: "pending", name: "job 4", needs: ["2"] },
  { id: "5", status: "pending", name: "job 5", needs: ["4", "1"] },
]);

const updateStatus = (
  jobid: string,
  status: "success" | "failed" | "progressing",
  ms: number,
) => {
  setTimeout(() => {
    jobStore.set(
      jobStore
        .get()
        .map((job) => (job.id === jobid ? { ...job, status } : job)),
    );
  }, ms);
};

const currentValueToTick = { current: 1500 };
const nextTick = () => (currentValueToTick.current += 850);
updateStatus("1", "progressing", nextTick());
updateStatus("1", "success", nextTick());
updateStatus("2", "progressing", nextTick());
updateStatus("2", "success", nextTick());
updateStatus("3", "progressing", nextTick());
updateStatus("3", "failed", nextTick());

const snap = async () => {
  const digestAlgorithm = "sha-256";
  const payload = new TextEncoder().encode(
    YAML.stringify({
      jobs: jobStore.get(),
    }),
  );

  const digest = `${digestAlgorithm}=${base64.fromByteArray(new Uint8Array(await crypto.subtle.digest(digestAlgorithm, payload)))}`;

  return {
    digest,
    payload,
  };
};

let keyRef: any = null;
let cache: ReturnType<typeof snap> | null = null;
const snapCache = () => {
  const ref = jobStore.get();
  if (cache !== null && keyRef === ref) return cache;
  keyRef = ref;
  cache = snap();
  return cache;
};

const memoryStore = atom(await snapCache());

jobStore.listen(async () => {
  memoryStore.set(await snapCache());
});

const handlerJobs = createHandlerJobs(memoryStore);

export const ALL: APIRoute = async ({ request }) => {
  return handlerJobs.fetch(request);
};
