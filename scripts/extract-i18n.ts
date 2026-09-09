// Extract English source strings into locales/en/survey.json (flat, stable keys),
// create English-fallback placeholders for hi/mr/te/as, and emit NEEDS_NATIVE_REVIEW.md.
// Run: node --experimental-strip-types scripts/extract-i18n.ts
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { QUESTIONS, CONSENT_TEXT } from "../lib/schema.ts";
import { BRAND_REPLACEMENTS } from "../lib/glossary.ts";

const LANGS = ["hi", "mr", "te", "as"];

const tokenize = (s: string) => BRAND_REPLACEMENTS.reduce((acc, [surface, tok]) => acc.split(surface).join(tok), s);

// UI / system strings (live in components, not the schema).
const UI: Record<string, string> = {
  "ui.loading": "Loading…",
  "ui.back": "Back",
  "ui.continue": "Continue",
  "ui.next": "Next",
  "ui.submit": "Submit",
  "ui.submitting": "Submitting…",
  "ui.select": "Select…",
  "ui.optional": "Optional",
  "ui.required_error": "Please answer this before continuing.",
  "ui.progress": "Part {{step}} of {{total}}",
  "ui.submit_error": "Could not submit. Please try again.",
  "consent.title": "Managing the family's health",
  "consent.lead": "A short survey, about 7–9 minutes. Your answers are confidential.",
  "consent.text": CONSENT_TEXT,
  "consent.agree": "I agree",
  "consent.decline": "I do not agree",
  "consent.begin": "Begin",
  "code.heading": "Do you have a code?",
  "code.help": "Enter the code you were given. It links your answers to the rest of your family. If you don't have one, please contact the person who sent you this.",
  "code.placeholder": "e.g. MANGO47",
  "code.error": "That code isn't recognised. Please check the code you were given.",
  "done.title": "Thank you",
  "done.body": "Your responses have been recorded.",
  "declined.title": "Thank you",
  "declined.body": "No answers have been recorded. You can close this page.",
};

const en: Record<string, string> = { ...UI };

for (const q of QUESTIONS) {
  en[`q.${q.id}.prompt`] = tokenize(q.prompt);
  if (q.help) en[`q.${q.id}.help`] = tokenize(q.help);
  if (q.id === "city") continue; // city option labels are proper nouns, rendered verbatim
  for (const o of q.options ?? []) en[`q.${q.id}.opt.${o.id}`] = tokenize(o.label);
}

mkdirSync("locales/en", { recursive: true });
writeFileSync("locales/en/survey.json", JSON.stringify(en, null, 2) + "\n");

// English-fallback placeholders: create only if missing so we don't clobber real translations.
for (const lng of LANGS) {
  mkdirSync(`locales/${lng}`, { recursive: true });
  const path = `locales/${lng}/survey.json`;
  if (!existsSync(path)) writeFileSync(path, "{}\n");
}

// Review manifest: every key + English value. All non-English keys need native review.
const lines = [
  "# NEEDS NATIVE-SPEAKER REVIEW",
  "",
  "Every key below is currently **English-fallback** in hi / mr / te / as. A native speaker",
  "must supply the translation for each, keeping meaning identical (survey data validity).",
  "`{{b_*}}` tokens are protected brand names — leave them exactly as-is; do not translate them.",
  "City names and ₹ are shown verbatim and are not listed here.",
  "",
  `Total keys to translate per language: **${Object.keys(en).length}**  (×4 languages = ${Object.keys(en).length * 4})`,
  "",
  "| key | English source |",
  "|---|---|",
  ...Object.entries(en).map(([k, v]) => `| \`${k}\` | ${v.replace(/\|/g, "\\|")} |`),
  "",
];
writeFileSync("NEEDS_NATIVE_REVIEW.md", lines.join("\n"));

console.log(`en keys: ${Object.keys(en).length}`);
console.log(`placeholder langs: ${LANGS.join(", ")}`);
console.log("wrote locales/en/survey.json, locales/<lng>/survey.json, NEEDS_NATIVE_REVIEW.md");
void readFileSync;
