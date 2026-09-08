import type { Opt, MRow, Question } from "./schema.ts";

// Deterministic RNG so a respondent sees a stable order across reloads/resume,
// and so the logged option position (D.3) matches what they actually saw.
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

/** Options in display order: shuffled non-pinned first, pinned (Other/None/Don't know) kept last. */
export function orderedOptions(q: Question, respondentId: string): Opt[] {
  const opts = q.options ?? [];
  if (!q.randomize) return opts;
  const rnd = mulberry32(hash(respondentId + "|" + q.id));
  const free = opts.filter((o) => !o.pinned);
  const pinned = opts.filter((o) => o.pinned);
  return [...shuffle(free, rnd), ...pinned];
}

/** Matrix rows in display order. randomize = shuffle all; randomizeWithinGroups = shuffle inside each group block. */
export function orderedRows(q: Question, respondentId: string): MRow[] {
  const rows = q.rows ?? [];
  if (q.randomize) {
    return shuffle(rows, mulberry32(hash(respondentId + "|" + q.id + "|rows")));
  }
  if (q.randomizeWithinGroups) {
    const rnd = mulberry32(hash(respondentId + "|" + q.id + "|rows"));
    const order: string[] = [];
    const byGroup: Record<string, MRow[]> = {};
    for (const r of rows) {
      const g = r.group ?? "_";
      if (!byGroup[g]) { byGroup[g] = []; order.push(g); }
      byGroup[g].push(r);
    }
    return order.flatMap((g) => shuffle(byGroup[g], rnd));
  }
  return rows;
}
