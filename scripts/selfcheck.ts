// Runnable check for the 22-question schema + randomization pins.
// Run: node --experimental-strip-types scripts/selfcheck.ts
import { QUESTIONS, QBYID } from "../lib/schema.ts";
import { orderedOptions } from "../lib/randomize.ts";

let failed = 0;
const assert = (cond: boolean, msg: string) => {
  if (!cond) { console.error("FAIL:", msg); failed++; } else { console.log("ok:", msg); }
};

// All 22 questions present.
for (let i = 1; i <= 22; i++) assert(!!QBYID["Q" + i], `Q${i} present`);

// Randomized set (B.5) is exactly these.
const RAND = new Set(["Q4", "Q6", "Q13", "Q16", "Q17", "Q19", "Q20", "Q21", "Q22"]);
QUESTIONS.forEach((q) => {
  if (q.id.startsWith("Q")) {
    assert(!!q.randomize === RAND.has(q.id), `${q.id} randomize flag matches spec (${RAND.has(q.id)})`);
  }
});

// SELECT ALL (multi) set.
const MULTI = new Set(["Q18", "Q19", "Q21"]);
QUESTIONS.forEach((q) => {
  if (q.id.startsWith("Q")) {
    assert((q.type === "multi") === MULTI.has(q.id), `${q.id} multi flag matches spec`);
  }
});

// Attention check.
const attn = QBYID["attn"];
assert(!!attn && attn.attention === "Twice", "attention check answer is 'Twice'");
assert(!!attn.options?.some((o) => o.id === "Twice"), "attention check offers 'Twice'");
assert(!!attn.noProgress, "attention check hides progress");

// Peak questions hide progress.
["Q10", "Q11", "Q12"].forEach((id) => assert(!!QBYID[id].noProgress, `${id} hides progress (no pressure)`));

// Relationship question captured in About you.
const rel = QBYID["relation"];
assert(!!rel && rel.type === "single" && !rel.optional, "relation is a required single-choice");
["Father", "Mother", "Son", "Daughter"].forEach((r) =>
  assert(!!rel.options?.some((o) => o.id === r), `relation offers ${r}`));

// Free text optional, others required.
assert(!!QBYID["worst_text"].optional, "worst_text is optional");
assert(!QBYID["Q1"].optional && !QBYID["followup"].optional, "Q1 and follow-up are required");

// Pinned options land LAST after randomization, across several respondent ids.
["Q13", "Q19", "Q20", "Q21"].forEach((id) => {
  const q = QBYID[id];
  const pinnedIds = new Set((q.options ?? []).filter((o) => o.pinned).map((o) => o.id));
  if (pinnedIds.size === 0) return;
  for (const rid of ["a", "seed-2", "xyz", "respondent-999"]) {
    const ord = orderedOptions(q, rid);
    const tail = ord.slice(ord.length - pinnedIds.size);
    const ok = tail.every((o) => pinnedIds.has(o.id));
    assert(ok, `${id} keeps pinned option(s) last (rid=${rid})`);
  }
});

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
if (failed) process.exit(1);
