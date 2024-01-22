import { type Atom } from "nanostores";
import * as YAML from "yaml";

type Options = {
  timeout: number;
};

const isRecord = (value: unknown): value is Record<any, any> =>
  typeof value === "object" && value !== null;
const isString = (value: unknown): value is string => typeof value === "string";
const isNull = (value: unknown): value is null => value === null;

const parseYAML = (value: unknown) => {
  if (typeof value !== "string") return null;
  try {
    return YAML.parse(value);
  } catch {
    return null;
  }
};

const isRequestPayload = (
  value: unknown,
): value is { continueDigest: string } =>
  isRecord(value) && isString(value.continueDigest);
const parseRequestPayload = (value: unknown) =>
  isRequestPayload(value) ? value : null;

type DigestResponse = { digest: string; payload: Uint8Array };
type Store<T> = Pick<Atom<T>, "get" | "off" | "listen">;

export const createHandlerJobs = <T extends DigestResponse, S extends Store<T>>(
  store: S,
  options?: Options,
) => {
  const timeout = options?.timeout ?? 30_000;

  const end = () => {
    store.off();
  };

  return {
    [Symbol.dispose]: end,
    end,
    async fetch(request: Request) {
      const continueDigest =
        parseRequestPayload(parseYAML(await request.text()))?.continueDigest ??
        null;
      let { digest, payload } = store.get();

      if (continueDigest === digest) {
        let resolve = (value: T) => {};
        const promise = new Promise<T>((r) => (resolve = r));
        const unSub = store.listen((snap) => resolve(snap));
        const t = setTimeout(() => resolve(store.get()), timeout);
        const currentState = await promise;

        digest = currentState.digest;
        payload = currentState.payload;

        unSub();
        clearTimeout(t);
      }

      const headers = new Headers();
      headers.set("Content-Type", "text/yaml");
      headers.set("Digest", digest);
      return new Response(payload, { headers });
    },
  };
};
