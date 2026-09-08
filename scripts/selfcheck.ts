// Runnable check for the trigger / exempt / cap logic.
// Run: node --experimental-strip-types scripts/selfcheck.ts
import { visibleQuestions, roleQuestions } from "../lib/visibility.ts";
import type { Role, Answers } from "../lib/schema.ts";

let failed = 0;
const ids = (role: Role, a: Answers) => new Set(visibleQuestions(role, a).map((q) => q.id));
const assert = (cond: boolean, msg: string) => {
  if (!cond) { console.error("FAIL:", msg); failed++; } else { console.log("ok:", msg); }
};

// Role D form is small and excludes A/B/C-only questions.
{
  const d = ids("D", {});
  assert(d.has("Q6.1"), "D sees Q6.1");
  assert(!d.has("Q6.3"), "D does not see Q6.3 (role A only)");
  assert(!d.has("Q9.1"), "D does not see Q9.1 (role C only)");
}

// T1: Q6.1 = Nobody hides Q6.3/Q6.5/Q13.2 for A, but exempt Q6.8/Q6.9 stay.
{
  const a = ids("A", { "Q6.1": "nobody" });
  assert(!a.has("Q6.3"), "T1 hides Q6.3 when Nobody");
  assert(!a.has("Q6.5"), "T1 hides Q6.5 when Nobody");
  assert(!a.has("Q13.2"), "T1 hides Q13.2 when Nobody");
  assert(a.has("Q6.8"), "Q6.8 stays (exempt even under T1)");
  assert(a.has("Q6.9"), "Q6.9 stays (exempt even under T1)");
}

// T8: Q6.2 only when Three or more.
{
  assert(!ids("A", { "Q6.1": "one" }).has("Q6.2"), "T8: Q6.2 hidden at 'one'");
  assert(ids("A", { "Q6.1": "three_plus" }).has("Q6.2"), "T8: Q6.2 shown at 'three_plus'");
}

// T3: Q1.3 only for different state / outside India.
{
  assert(!ids("A", { "Q1.2": "same_city" }).has("Q1.3"), "T3: Q1.3 hidden for same_city");
  assert(ids("A", { "Q1.2": "diff_state" }).has("Q1.3"), "T3: Q1.3 shown for diff_state");
}

// T2: not_applicable hides Q1.4/Q7.2/Q8.1/Q10.3.
{
  const a = ids("A", { "Q1.2": "not_applicable" });
  assert(!a.has("Q1.4"), "T2 hides Q1.4");
  assert(!a.has("Q7.2"), "T2 hides Q7.2");
  assert(!a.has("Q8.1"), "T2 hides Q8.1");
  assert(!a.has("Q10.3"), "T2 hides Q10.3");
}

// Q3.3 shows for Role C even though Q1.2 is never asked to C.
{
  assert(ids("C", {}).has("Q3.3"), "Q3.3 shows for C (no Q1.2 to fire T2)");
}

// T7: Q5.3 hidden only when money never delayed AND no bill overrun.
{
  assert(!ids("A", { "Q5.1": "no", "Q2.8": ["nothing"] }).has("Q5.3"), "T7 hides Q5.3");
  assert(ids("A", { "Q5.1": "no", "Q2.8": ["bill_higher"] }).has("Q5.3"), "T7: bill overrun shows Q5.3");
  assert(ids("A", { "Q5.1": "test_postponed" }).has("Q5.3"), "T7: money-delay shows Q5.3");
}

// T5 via Q6.5 proxy: Q6.7 only when online/quick ordering AND meds taken.
{
  const base = { "Q6.1": "one" };
  assert(!ids("A", { ...base, "Q6.5": ["local_walkin"] }).has("Q6.7"), "T5: Q6.7 hidden without online");
  assert(ids("A", { ...base, "Q6.5": ["online_pharmacy"] }).has("Q6.7"), "T5: Q6.7 shown with online pharmacy");
  assert(!ids("A", { "Q6.1": "nobody", "Q6.5": ["online_pharmacy"] }).has("Q6.7"), "T5: Q6.7 hidden when Nobody");
}

// T9: Q9.9 only when Q9.8 includes passwords_otps (role C).
{
  assert(!ids("C", { "Q9.8": ["small"] }).has("Q9.9"), "T9: Q9.9 hidden without OTP pain");
  assert(ids("C", { "Q9.8": ["passwords_otps"] }).has("Q9.9"), "T9: Q9.9 shown with OTP pain");
}

// T6: Q3.7 only when a digital location ticked in Q3.2.
{
  assert(!ids("A", { "Q3.2": ["file_folder"] }).has("Q3.7"), "T6: Q3.7 hidden with only paper");
  assert(ids("A", { "Q3.2": ["email_drive"] }).has("Q3.7"), "T6: Q3.7 shown with digital location");
}

// Cap: Role A worst case never exceeds 78 questions.
{
  const worst: Answers = {
    "Q1.2": "diff_state", "Q2.8": ["bill_higher"], "Q5.1": "test_postponed",
    "Q6.1": "three_plus", "Q6.5": ["online_pharmacy"],
    "Q10.1": { cleared: false, cells: { r_1mg: "stopped" } },
  };
  const n = visibleQuestions("A", worst).length;
  assert(n <= 78, `Role A cap holds (got ${n})`);
  assert(roleQuestions("D").length < roleQuestions("A").length, "D form is shorter than A form");
}

console.log(failed === 0 ? "\nALL PASS" : `\n${failed} FAILED`);
if (failed) process.exit(1);
