import { QUESTIONS } from "./schema.ts";
import type { Question, Role, Answers } from "./schema.ts";

// A.5 — if a Role A path exceeds 78 questions, drop in this exact order.
const DROP_ORDER = ["Q6.2", "Q3.7", "Q5.3", "Q13.2", "Q4.1"];
const CAP = 78;

function passesTrigger(q: Question, answers: Answers): boolean {
  // Exempt questions (A.4) are never skipped by a trigger.
  if (q.exempt) return true;
  if (!q.visibleWhen) return true;
  return q.visibleWhen(answers);
}

/** Every question a role could ever see, ignoring triggers. Used for a stable step count. */
export function roleQuestions(role: Role): Question[] {
  return QUESTIONS.filter((q) => q.roles.includes(role));
}

/** The sections that make up this role's form, in order — the fixed "Part X of Y" denominator. */
export function roleSections(role: Role): number[] {
  const s = new Set<number>();
  roleQuestions(role).forEach((q) => s.add(q.section));
  return [...s].sort((a, b) => a - b);
}

/** Currently-visible questions for a role given the answers so far, after triggers and the 78-cap. */
export function visibleQuestions(role: Role, answers: Answers): Question[] {
  let list = roleQuestions(role).filter((q) => passesTrigger(q, answers));

  if (role === "A" && list.length > CAP) {
    const drop = new Set<string>();
    for (const id of DROP_ORDER) {
      if (list.length - drop.size <= CAP) break;
      if (list.some((q) => q.id === id)) drop.add(id);
    }
    list = list.filter((q) => !drop.has(q.id));
  }
  return list;
}

/** Visible questions within one section (one screen / "Part"). */
export function sectionQuestions(role: Role, answers: Answers, section: number): Question[] {
  return visibleQuestions(role, answers).filter((q) => q.section === section);
}
