export type { JobContext } from "./interfaces/job.ts";
export type { StorageService } from "./interfaces/storage-service.ts";
import { nextTick } from "process";
import { DSN, Closing } from "./dsn.ts";
import { State } from "./dto/state.ts";
import { Event } from "./interfaces/event.ts";
import type { JobContext } from "./interfaces/job.ts";
import type { StorageService } from "./interfaces/storage-service.ts";

type JobState = {
  state: State;
};

type RawJson = {
  indexes: string[];
  relations: [string, string][];
  jobStates: Record<string, JobState>;
};

namespace RawJsonSchemaValidator {
  type Ctx = {
    path: string[];
  };

  const wrapVal = <T>(ctx: Ctx, cb: (value: T) => boolean) => {
    return (value: T) => {
      const res = cb(value);

      return res;
    };
  };
  const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;
  const isString = (value: unknown): value is string =>
    typeof value === "string";

  export const isRawJson = (
    value: unknown,
    ctx: Ctx = { path: [] },
  ): value is RawJson =>
    isObject(value) &&
    Array.isArray(value.indexes) &&
    value.indexes.every(isString) &&
    Array.isArray(value.relations) &&
    value.relations.every(([k, p]) => isString(k) && isString(p)) &&
    isObject(value.jobStates) &&
    Object.entries(value.jobStates).every(
      ([k, jobState]) =>
        isString(k) && isObject(jobState) && isString(jobState.state),
    );
}

const isRawJson = RawJsonSchemaValidator.isRawJson;

const createLocalStorageService = (): StorageService =>
  new Map<string, unknown>() as unknown as StorageService;

export class Manager {
  private relations: [JobContext<any>, JobContext<any>][] = [];
  private jobStates = new Map<JobContext<any>, JobState>();
  private jobIndexes: Map<string, JobContext<any>>;
  private subs = new Set<(event: Event) => void>();
  private storageService: StorageService = createLocalStorageService();

  private constructor(
    readonly sid: string,
    readonly did: string | undefined,
    private indexes: Map<JobContext<any>, string>,
    readonly jobs: Set<JobContext<any>>,
  ) {
    this.jobIndexes = new Map(
      Array.from(indexes.entries()).map(([job, id]) => [id, job]),
    );

    for (const job of jobs) {
      for (const parent of Object.values(job.input ?? {})) {
        this.relations.push([parent, job]);
      }
    }
  }

  subscribeChange(cb: (event: Event) => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }

  private emitChange(event: Event) {
    this.subs.forEach((sub) => sub(event));
  }

  jobById(id: string) {
    const job = this.jobIndexes.get(id);
    if (!job) throw new Error(`Cannot found job with id ${id}`);
    return job;
  }

  indexOfJob(job: JobContext<any>) {
    const index = this.indexes.get(job);
    if (!index) throw new Error(`Cannot found index`, { cause: job });
    return index;
  }

  childrenOfJob(job: JobContext<any>) {
    return new Set(
      this.relations
        .filter(([parent, child]) => parent === job)
        .map(([, child]) => child),
    );
  }

  parentOfJob(job: JobContext<any>) {
    return new Set(
      this.relations
        .filter(([parent, child]) => job === child)
        .map(([parent]) => parent),
    );
  }

  stateOfJob(job: JobContext<any>) {
    return this.jobStates.get(job) ?? null;
  }

  async updateState(job: JobContext<any>, state: State): Promise<void> {
    this.jobStates.set(job, {
      ...this.jobStates.get(job),
      state,
    });

    this.emitChange({
      type: "updateState",
      timestamp: Date.now(),
      jobId: job.id,
      state: state,
    });
  }

  async resetState(job: JobContext<any>): Promise<void> {
    this.jobStates.delete(job);
  }

  async runJob(job: JobContext<any>) {
    const args: Record<string, unknown> = {};
    for (const [key, jobInput] of Object.entries(job.input ?? {})) {
      if (!(await this.storageService.has(jobInput.id)))
        throw new Error(`this job need run ${key}`);
      args[key] = await this.storageService.get(jobInput.id);
    }
    await this.updateState(job, State.Running);
    try {
      const res = await job.cb(args);
      await this.updateState(job, State.Success);
      await this.storageService.set(job.id, res);
      return res;
    } catch (ex) {
      await this.updateState(job, State.Failed);
      throw ex;
    }
  }

  *nextJobs(): Generator<JobContext<any>> {
    for (const job of this.jobs) {
      const parents = this.parentOfJob(job);
      if (
        this.stateOfJob(job)?.state !== State.Success &&
        Array.from(parents).every(
          (parent) => this.stateOfJob(parent)?.state === State.Success,
        )
      ) {
        yield job;
      }
    }
  }

  async *[Symbol.asyncIterator]() {
    let job: JobContext<any> | null = null;
    const next = () => this.nextJobs().next().value ?? null;
    while ((job = await next())) {
      yield job;
      await this.updateState(job, State.Success);
    }
  }

  toJSON(): RawJson {
    return {
      indexes: Array.from(this.indexes.values()),
      relations: this.relations.map(([a, b]) => [
        this.indexOfJob(a),
        this.indexOfJob(b),
      ]),
      jobStates: Object.fromEntries(
        Array.from(this.jobStates.entries()).map(([job, state]) => [
          this.indexOfJob(job),
          state,
        ]),
      ),
    };
  }

  static fromJson<J extends JobContext<any>>(raw: unknown, ...jobs: J[]) {
    if (!isRawJson(raw)) throw new Error(`invalid raw schema`, { cause: raw });

    const manager = this.create({ jobs: [...jobs] });
    const managerIndexes = Array.from(manager.indexes);
    if (managerIndexes.length !== raw.indexes.length)
      throw new Error(`${raw.indexes} jobs expected`);
    const indexesStr = new Set(manager.indexes.values());
    for (const indexJob of raw.indexes) {
      if (!indexesStr.has(indexJob)) {
        throw new Error(`Cannot found job id ${indexJob}`);
      }
    }

    const indexesJob = new Map(
      Array.from(manager.indexes.entries()).map(([job, jobIndex]) => [
        jobIndex,
        job,
      ]),
    );
    Object.entries(raw.jobStates).forEach(([jobIndex, jobState]) => {
      manager.jobStates.set(indexesJob.get(jobIndex)!, jobState);
    });

    return manager;
  }

  toFlowchart(options?: {
    formatNodeId?: (
      indexJob: string,
      job: JobContext<any>,
      manager: Manager,
    ) => string;
    formatLinkBetweenNodes?: (
      jobLeft: JobContext<any>,
      jobRight: JobContext<any>,
      manager: Manager,
    ) => string;
    formatNodeLabel?: (
      nodeId: string,
      job: JobContext<any>,
      manager: Manager,
    ) => string;
  }) {
    const formatNodeId =
      options?.formatNodeId ?? ((nodeId) => nodeId.replace(/\W/g, "_"));
    const formatLinkBetweenNodes =
      options?.formatLinkBetweenNodes ?? (() => `-->`);
    const formatNodeLabel =
      options?.formatNodeLabel ?? ((nodeId, job) => `${nodeId}`);

    return (
      `flowchart LR\n` +
      "\n" +
      Array.from(this.jobs)
        .map(
          (job) =>
            `${formatNodeLabel(formatNodeId(this.indexOfJob(job), job, this), job, this)}\n`,
        )
        .join("") +
      "\n" +
      Array.from(this.jobs)
        .map((job) => {
          return Array.from(this.childrenOfJob(job))
            .map((child) => {
              const idJobLeft: string = formatNodeId(
                this.indexOfJob(job),
                job,
                this,
              );
              const idJobRight: string = formatNodeId(
                this.indexOfJob(child),
                child,
                this,
              );
              const jobLeft: JobContext<any> = job;
              const jobRight: JobContext<any> = child;
              return `${idJobLeft} ${formatLinkBetweenNodes(jobLeft, jobRight, this)} ${idJobRight}\n`;
            })
            .join("");
        })
        .join("")
    );
  }

  static create<
    J extends JobContext<any>,
    O extends {
      /**
       * Session ID
       * @default {uuid value}
       */
      sid?: string;
      /**
       * Distinct ID
       */
      did?: string;
      dsn?: string;
      jobs: J[];
      signal?: AbortSignal;
    },
  >(
    options: O,
  ): O extends { signal: AbortSignal }
    ? Manager
    : Manager & { [Symbol.dispose]: () => void } {
    const sid = options.sid ?? crypto.randomUUID();
    const did = options.did;
    const jobs = options.jobs;
    const dsn = options.dsn;
    const defaultAbortControl = new AbortController();
    const signal = options.signal ?? defaultAbortControl.signal;

    let lastIndexGenerated = 0;
    const relationIndexes = new Map<JobContext<any>, string>();
    const jobsList = new Set<JobContext<any>>();
    const indexes = new Set<string>();

    const addJob = (job: JobContext<any>) => {
      if (relationIndexes.has(job)) return;

      const indexJob = job.id ?? `${++lastIndexGenerated}`;

      if (indexes.has(indexJob))
        throw new Error(`Already index ${indexJob} used`);
      indexes.add(indexJob);

      relationIndexes.set(job, indexJob);
      jobsList.add(job);

      Object.values(job.input ?? {}).forEach(addJob);
    };

    jobs.forEach(addJob);

    const manager = new Manager(sid, did, relationIndexes, jobsList);

    if (dsn) {
      DSN.create(manager, dsn, { signal });
    }

    if (signal === defaultAbortControl.signal) {
      Reflect.set(manager, Symbol.asyncDispose, async () => {
        const reason = new Closing();
        defaultAbortControl.abort(reason);
        await Promise.all(Array.from(reason.waitings));
      });
    }

    return manager as any;
  }

  static putStorageService(manager: Manager, storageService: StorageService) {
    manager.storageService = storageService;
  }

  static linkManager(managerFrom: Manager, managerTo: Manager) {
    managerFrom.subscribeChange((event) => {
      if (event.type === "updateState") {
        managerTo.updateState(managerTo.jobById(event.jobId), event.state);
      }
    });
  }
}
