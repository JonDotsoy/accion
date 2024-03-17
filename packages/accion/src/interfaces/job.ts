import type { Arg } from "./arg.ts";

export type JobOptions<I extends Record<string, JobContext<any>>> = {
  id?: string;
  description?: string;
  input?: I;
};

export type JobContext<_R extends JobReturn> = {
  id: string;
  input: null | Record<string, JobContext<any>>;
  description: null | string;
  cb: (...args: any[]) => any;
};
export type JobReturn = Arg | void;
export type JobCb<R extends JobReturn> =
  | R
  | Promise<R>
  | Generator<R>
  | AsyncGenerator<R>;
export type ReturnTypeByJobContext<T> =
  T extends JobContext<infer R> ? R : never;
export type ReturnTypeByJobCb<T> = T extends JobCb<infer R> ? R : never;
export type InputValues<T> =
  T extends Record<string, JobContext<any>>
    ? { [K in keyof T]: ReturnTypeByJobContext<T[K]> }
    : never;

export type JobArgs<
  R extends JobReturn,
  I extends Record<string, JobContext<any>>,
> =
  | [cb: () => JobCb<R>]
  | [input: JobOptions<I>, cb: (input: InputValues<I>, ctx: I) => JobCb<R>]
  | [string, cb: () => JobCb<R>]
  | [
      string,
      input: JobOptions<I>,
      cb: (input: InputValues<I>, ctx: I) => JobCb<R>,
    ];

export type Job<
  R extends JobReturn,
  I extends Record<string, JobContext<any>>,
> = (..._args: JobArgs<R, I>) => JobContext<R>;
