import type { Opt, Question } from "./schema.ts";

// Deterministic RNG so a respondent sees a stable option order across reloads/resume,
// and so the logged option position (data quality) matches what they actually saw.
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Options in display order: shuffled non-pinned first, pinned (None/Nobody/I don't know) kept last. */
export function orderedOptions(q: Question, respondentId: string): Opt[] {
  const opts = q.options ?? [];
  if (!q.randomize) return opts;
  const rnd = mulberry32(hash(respondentId + "|" + q.id));
  const free = opts.filter((o) => !o.pinned);
  const pinned = opts.filter((o) => o.pinned);
  return [...shuffle(free, rnd), ...pinned];
}
