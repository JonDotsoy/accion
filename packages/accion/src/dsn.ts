import { nextTick } from "process";
import { Event } from "./interfaces/event";
import type { Manager } from "./manager";
import { atom } from "nanostores";

export class Closing {
  waitings = new Set<Promise<unknown>>();
}

export abstract class DSN {
  static create(
    manager: Manager,
    source: DSN | string,
    options?: { signal?: AbortSignal },
  ) {
    if (source instanceof DSN) return source;
    if (typeof source === "string")
      return new FetchDSN(manager, source, { signal: options?.signal });
    throw new Error(`Invalid dsn source`);
  }
}

type FetchDSNOptions = {
  signal?: AbortSignal;
  limitBytesPerRequest?: number;
};

export class FetchDSN extends DSN {
  eventsLayer = new Set<Event>();
  eventsLayerIds = new Map<Event, string>();
  limitBytesPerRequest: number;
  requestLoopStack = atom(new Set<Request>());
  signal?: AbortSignal;
  preventStopped = false;

  constructor(
    readonly manager: Manager,
    readonly uri: string,
    readonly options?: FetchDSNOptions,
  ) {
    super();
    this.signal = options?.signal;
    this.limitBytesPerRequest = options?.limitBytesPerRequest ?? 8000;
    if (this.signal?.aborted) {
      throw new Error(`Signal already aborted`);
    }
    const unsubscribeManager = manager.subscribeChange((event) => {
      this.eventsLayer.add(event);
    });

    this.signal?.addEventListener("abort", () => {
      const reason = this.signal?.reason;
      unsubscribeManager();
      if (reason instanceof Closing) {
        this.preventStopped = true;
        const { promise, resolve } = Promise.withResolvers<void>();
        this.requestLoopStack.subscribe(() => {
          if (
            this.eventsLayer.size === 0 &&
            this.requestLoopStack.get().size === 0
          ) {
            resolve();
            this.preventStopped = false;
            this.requestLoopStack.off();
          }
        });
        reason.waitings.add(promise);
      }
    });
    this.startSyncLoop();
  }

  private isStopped() {
    if (this.preventStopped) return false;
    return this.signal?.aborted ?? false;
  }

  readEventLayer() {
    const bytes: number[] = [];
    for (const event of this.eventsLayer) {
      const bytesLine = new TextEncoder().encode(`${JSON.stringify(event)}\n`);
      if (bytes.length + bytesLine.length > this.limitBytesPerRequest) {
        break;
      }
      bytes.push(...bytesLine);
      this.eventsLayer.delete(event);
    }

    if (bytes.length === 0) return;

    const headers = new Headers();
    headers.set("Content-Type", "application/jsonl; charset=utf-8");
    headers.set("Date", new Date().toUTCString());
    const request = new Request({
      method: "POST",
      url: this.uri,
      headers,
      body: new Uint8Array(bytes),
      signal: this.signal,
    });

    const nextRequestLoopStack = new Set(this.requestLoopStack.get());
    nextRequestLoopStack.add(request);
    this.requestLoopStack.set(nextRequestLoopStack);
  }

  startSyncLoop() {
    const loadProcess = async () => {
      if (this.isStopped()) return { fetches: 0 };

      let fetches = 0;
      for (const request of this.requestLoopStack.get()) {
        fetches += 1;
        await fetch(request);
        const nextRequestLoopStack = new Set(this.requestLoopStack.get());
        nextRequestLoopStack.delete(request);
        this.requestLoopStack.set(nextRequestLoopStack);
      }
      return { fetches };
    };

    const loopAsync = async () => {
      while (!this.isStopped()) {
        const { promise, resolve } = Promise.withResolvers<void>();
        setTimeout(() => resolve(), 50);
        this.readEventLayer();
        await loadProcess();
        await promise;
      }
    };
    loopAsync();
  }
}
