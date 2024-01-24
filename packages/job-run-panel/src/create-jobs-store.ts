import base64 from "base64-js";
import { atom } from "nanostores";
import * as YAML from "yaml";
import type { Job } from "../www/interfaces/Job";

type Options = {
  digestAlgorithm?: string
}

export const createJobStore = <T extends { jobs: Job[] }>(options?: Options) => {
  const digestAlgorithm = options?.digestAlgorithm ?? "sha-256";
  const store = atom({ digest: '', payload: new Uint8Array([]) })

  const update = async (data: T) => {
    const payload = new TextEncoder().encode(
      YAML.stringify(data),
    );
    const digest = `${digestAlgorithm}=${base64.fromByteArray(new Uint8Array(await crypto.subtle.digest(digestAlgorithm, payload)))}`;
    store.set({ digest, payload })
  }

  return { store, update }
}
