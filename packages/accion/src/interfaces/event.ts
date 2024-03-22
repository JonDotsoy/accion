import { State } from "../dto/state.js";

export const enum EventTypes {}

export type Event = {
  type: "updateState";
  /** Returns the number of milliseconds elapsed since midnight, January 1, 1970 Universal Coordinated Time (UTC). */
  timestamp: number;
  jobId: string;
  state: State;
};
