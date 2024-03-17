import { test, afterAll, expect, beforeAll } from "bun:test";
import { Expose } from "../src/expose.ts";
import { job } from "../src/job.ts";
import { Manager } from "../src/manager.ts";

const ends = new Set<() => Promise<void> | void>();

afterAll(async () => {
  for (const end of ends) {
    await end();
  }
});

/** helper fetch */
const fetchText = async (url: URL) => {
  const res = await fetch(url);
  const headers = res.headers;
  return res.text();
};
const fetchJson = async (url: URL) => {
  const res = await fetch(url);
  return res.json();
};

const job1 = job("1", () => 1);
const job2 = job("2", { input: { job1 } }, ({ job1 }) => job1 + 2);
const job3 = job(
  "3",
  { input: { job1, job2 } },
  ({ job1, job2 }) => job1 + job2 + 3,
);

const manager = Manager.create({ jobs: [job1, job2, job3] });

const expose = new Expose(manager, { verbose: true });
const makeURL = (urlLike: string | URL) =>
  new URL(urlLike, expose.server?.url() ?? undefined);
ends.add(() => expose.close());

beforeAll(() => expose.listen());

test("expect 404 response", async () => {
  const res = await fetch(makeURL("/not-found"));
  expect(res.status).toEqual(404);
});

test("expect status response", async () => {
  const res = await fetch(makeURL("/status"));
  expect(res.status).toEqual(200);
  expect(await res.json()).toEqual({
    ok: true,
    manager: {
      indexes: ["1", "2", "3"],
      jobStates: {},
      relations: [
        ["1", "2"],
        ["1", "3"],
        ["2", "3"],
      ],
    },
  });
});

test("init local service", async function () {
  expect(await fetchText(makeURL("/flowchart"))).toEqual(
    "flowchart LR\n" +
      "\n" +
      "1\n" +
      "2\n" +
      "3\n" +
      "\n" +
      "1 --> 2\n" +
      "1 --> 3\n" +
      "2 --> 3\n",
  );
});

test("calling a job", async () => {
  expect(
    (await fetch(makeURL("/job/1/run"), { method: "POST" })).status,
  ).toEqual(201);
  const res: any = await (await fetch(makeURL("/status"))).json();
  expect(res?.manager?.jobStates?.["1"]?.state).toEqual("success");
});
