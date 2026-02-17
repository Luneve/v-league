import { AsyncLocalStorage } from "node:async_hooks";

const ENABLED = process.env.PERF_LOG === "1";

interface PerfCtx {
  route: string;
  timers: Map<string, number>;
  results: { route: string; step: string; ms: number }[];
}

const als = new AsyncLocalStorage<PerfCtx>();

/** Begin a new perf-tracking scope for one request. Call at the top of a layout or page. */
export function perfRoute(route: string) {
  if (!ENABLED) return;
  const ctx: PerfCtx = { route, timers: new Map(), results: [] };
  als.enterWith(ctx);
}

/** Start a named timer within the current request scope. */
export function perfStart(label: string) {
  if (!ENABLED) return;
  als.getStore()?.timers.set(label, performance.now());
}

/** End a named timer and record the elapsed ms. */
export function perfEnd(label: string) {
  if (!ENABLED) return;
  const ctx = als.getStore();
  if (!ctx) return;
  const start = ctx.timers.get(label);
  if (start === undefined) return;
  const ms = Math.round((performance.now() - start) * 100) / 100;
  ctx.results.push({ route: ctx.route, step: label, ms });
  ctx.timers.delete(label);
}

/** Log all recorded timings as structured JSON lines and reset. */
export function perfSummary() {
  if (!ENABLED) return;
  const ctx = als.getStore();
  if (!ctx || ctx.results.length === 0) return;
  const total = ctx.results.reduce((sum, r) => sum + r.ms, 0);
  for (const r of ctx.results) {
    console.log(JSON.stringify(r));
  }
  console.log(JSON.stringify({ route: ctx.route, step: "TOTAL", ms: Math.round(total * 100) / 100 }));
  ctx.results.length = 0;
  ctx.timers.clear();
}
