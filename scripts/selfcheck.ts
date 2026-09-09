// Runnable check for the 22-question schema + randomization pins.
// Run: node --experimental-strip-types scripts/selfcheck.ts
import { readFileSync } from "node:fs";
import { QUESTIONS, QBYID } from "../lib/schema.ts";
import { orderedOptions } from "../lib/randomize.ts";
import { GLOSSARY } from "../lib/glossary.ts";

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

// ---- i18n coverage: every schema string has an English key, brands tokenized ----
const en: Record<string, string> = JSON.parse(readFileSync("locales/en/survey.json", "utf8"));
let missing = 0;
for (const q of QUESTIONS) {
  if (!(`q.${q.id}.prompt` in en)) { console.error("MISSING key q." + q.id + ".prompt"); missing++; }
  if (q.help && !(`q.${q.id}.help` in en)) { console.error("MISSING help " + q.id); missing++; }
  if (q.id === "city") continue;
  for (const o of q.options ?? []) {
    if (!(`q.${q.id}.opt.${o.id}` in en)) { console.error(`MISSING opt ${q.id}/${o.id}`); missing++; }
  }
}
assert(missing === 0, `every schema prompt/help/option has an English key (missing=${missing})`);

const UI_KEYS = [
  "ui.loading", "ui.back", "ui.continue", "ui.next", "ui.submit", "ui.submitting",
  "ui.select", "ui.optional", "ui.required_error", "ui.progress", "ui.submit_error",
  "consent.title", "consent.lead", "consent.text", "consent.agree", "consent.decline", "consent.begin",
  "code.heading", "code.help", "code.placeholder", "code.error",
  "done.title", "done.body", "declined.title", "declined.body",
];
UI_KEYS.forEach((k) => assert(k in en, `UI key present: ${k}`));

// Brands are protected tokens, not raw text, and every token has a glossary value.
const brandStr = en["q.Q18.opt.A medicine app — 1mg, PharmEasy, Apollo, Netmeds, Zeno"] ?? "";
assert(brandStr.includes("{{b_1mg}}") && brandStr.includes("{{b_pharmeasy}}") && !brandStr.includes("PharmEasy"),
  "Q18 brands are tokenized ({{b_*}}), not raw");
assert((en["q.Q6.opt.Open a folder in email or Google Drive"] ?? "").includes("{{b_googledrive}}"),
  "Google Drive tokenized in Q6");
let badTok = 0;
for (const v of Object.values(en)) {
  for (const m of v.matchAll(/{{(b_[a-z0-9]+)}}/g)) if (!(m[1] in GLOSSARY)) { console.error("no glossary value for", m[1]); badTok++; }
}
assert(badTok === 0, "every {{b_*}} token has a glossary value");

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
if (failed) process.exit(1);
