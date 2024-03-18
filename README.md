# ACCION

accion "Another Continuous Integration and Continuous Delivery (CI/CD)"

Easy way to write workflows.

## Understanding accion

## API

### Manager Jobs

API provide a general control to orchestrate the jobs.

### `workflow.job(name?: string, dependencies?: Record<string, Job>, handler?: (dependencies: Record<string, any>) => Promise<any> | any) => Job`

this function is used to describe a job.

**Arguments:**

- name: describe a unique identifier to call this job. If is not defined the default values is `main`.
- dependencies: dependencies of other jobs. When the job is called the first argument to the handler will be an object with their values.
- handler: all behavior to run this job

### workflow file

Ideas:

- Write a javascript file
- Auto describe the steps to run

Is file to describe all workflow to run scripts. this file look as this:

```typescript
// main.workflow.ts
import { job } from "accion/workflow";

job(() => {
  console.log("ok");
  return {};
});
```

## Guide

### First Job

Write a job file on typescript file.

```ts
/// jobs.ts
import { job } from "accion/workflow";

job("read file", async () => {
  console.log("read file ok.");
  return { ok: true };
});
```

Now run this job with the command `accion`. This command require an id to save
the store.

```shell
$ accion run foo "read file"
# read file ok.
# { "ok": true }
```

The second execution with same id return only the result stored.

```shell
$ accion run foo "read file"
# { "ok": true }
```

To join multiple jobs using dependencies

```ts
/// jobs.ts
import { job } from "accion/workflow";

const randomNumber = job("get random number", () => {
  const randomNumber = Math.random();
  console.log(`thinking a number: ${randomNumber}`);
  return randomNumber;
});

job("write file", { randomNumber }, async ({ randomNumber }) => {
  console.log(`Write the random number ${randomNumber}`);
  return { ok: true };
});

job("get number", { randomNumber }, async ({ randomNumber }) => {
  console.log(`The random number is ${randomNumber}`);
  return { randomNumber };
});
```

```shell
$ accion run biz "write file"
# thinking a number: 0.3
# Write the random number 0.3
# { "ok": true }
$ accion run biz "get number"
# The random number is 0.3
# { "randomNumber": 0.3 }
$ accion run biz "get number"
# { "randomNumber": 0.3 }
```

### Test Job

A Job object can be use as a function.

**jobs.ts**

```ts
export const nextSunday = job("get number", async () => {
  return new Date("2023-12-31");
});

export const pushDate = job(
  "push date",
  { nextSunday },
  async ({ nextSunday }) => {
    await fetch(`http://my-service/create/sunday`, {
      method: "POST",
      data: `${nextSunday}`,
    });
    return true;
  },
);
```

**tests.ts**

```ts
test("...", async () => {
  const { pushDate } = await import("./jobs.ts");

  const res = await pushDate.call({ nextSunday: new Date("2023-12-03") });

  expect(res).toBeTrue();
});
```

## Documentations

### CLI

#### run <id> <job_name>

This command run a job on a id specific.

**Output:**

A json with the result.
