import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

const logLevel = v.union(
  v.literal("DEBUG"),
  v.literal("INFO"),
  v.literal("WARN"),
  v.literal("ERROR"),
);
export type LogLevel = Infer<typeof logLevel>;

export const options = {
  initialBackoffMs: v.number(),
  base: v.number(),
  maxFailures: v.number(),
  logLevel,

  onComplete: v.optional(v.string()),
};
const optionsObj = v.object(options);
export type Options = Infer<typeof optionsObj>;

export const runResult = v.union(
  v.object({
    type: v.literal("success"),
    returnValue: v.any(),
    runId: v.string(),
  }),
  v.object({
    type: v.literal("failed"),
    error: v.string(),
    runId: v.string(),
  }),
  v.object({
    type: v.literal("canceled"),
    runId: v.string(),
  }),
);
export type RunResult = Infer<typeof runResult>;

export const runState = v.union(
  v.object({
    type: v.literal("inProgress"),

    // This is only set to `undefined` during initialization.
    schedulerId: v.optional(v.id("_scheduled_functions")),

    // Time we scheduled the execution to begin, which may be in the future
    // if we are backing off.
    startTime: v.number(),
  }),
  v.object({
    type: v.literal("completed"),
    completedAt: v.number(),
    result: runResult,
  }),
);
export type RunState = Infer<typeof runState>;

export default defineSchema({
  runs: defineTable({
    functionHandle: v.string(),
    functionArgs: v.any(),

    options: v.object(options),

    state: runState,
    numFailures: v.number(),
  }).index("by_state", ["state.type", "state.completedAt"]),
});
