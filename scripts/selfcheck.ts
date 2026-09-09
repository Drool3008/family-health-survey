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

// SELECT ALL (multi) set — updated per family-health-survey-20 (1).md B.6.
const MULTI = new Set(["Q7", "Q11", "Q15", "Q18", "Q19", "Q21"]);
QUESTIONS.forEach((q) => {
  if (q.id.startsWith("Q")) {
    assert((q.type === "multi") === MULTI.has(q.id), `${q.id} multi flag matches spec`);
  }
});

// Attention check.
const attn = QBYID["attn"];
assert(!!attn && attn.attention === "Twice", "attention check answer is 'Twice'");
assert(!!attn.options?.some((o) => o.id === "Twice"), "attention check offers 'Twice'");

// Progress must never be hidden now — no question carries a progress-hiding flag.
assert(QUESTIONS.every((q) => !(q as any).noProgress), "no question hides the progress bar (B.5)");

// Exclusive (clears-the-rest) options on the multi questions that need them.
["Q11", "Q18", "Q19", "Q21"].forEach((id) =>
  assert(!!QBYID[id].options?.some((o) => o.exclusive), `${id} has an exclusive clears-others option`));

// Q8/Q9 reword from the Q1 answer, and differ by that answer.
["Q8", "Q9"].forEach((id) => assert(typeof QBYID[id].promptFor === "function", `${id} has a dynamic promptFor`));
const p8 = QBYID["Q8"].promptFor!;
assert(p8({ Q1: "My mother" }).includes("your mother") && p8({ Q1: "I do" }).includes("you"),
  "Q8 prompt reflects the Q1 answer");
assert(p8({ Q1: "My mother" }) !== p8({ Q1: "My father" }), "Q8 prompt differs by Q1 selection");

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
