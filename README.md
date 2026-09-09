# Family Health Survey (22 questions)

Self-hosted web form for *The Ken Case Competition 2026*, built from
`family-health-survey-20.md`. Next.js (App Router) + one API route that appends
each submission to a Google Sheet via an Apps Script webhook.

## Flow

consent → **family code gate** → about you (age / city / gender) → **Q1–Q22, one per screen** → submit.

## What it implements (per the spec)

- **Same form for everyone. No roles, no branching.** Every respondent answers all 22.
- **Family code gate:** enter a code (12 hardcoded in `lib/codes.ts`, case-insensitive). The code groups a family; Q1 records who each member is. Members share one code.
- **Randomized options** on Q4, Q6, Q13, Q16, Q17, Q19, Q20, Q21, Q22, with `None / Nobody / I don't know` pinned last (B.5).
- **SELECT ALL** on Q18, Q19, Q21.
- **Attention check** after Q15: must choose "Twice". Recorded (column `attentionPass` = PASS/FAIL), not blocking; back-navigation is locked across it. Exclude FAIL rows in analysis.
- **Peak questions Q10, Q11, Q12** and the attention check hide the progress bar ("no progress pressure").
- **Forced response** on all 22; only the free-text box is skippable.
- **Save & resume** via `localStorage` (same device). **Timing** per question (with displayed option position) captured and stored in `_timeline`.

## Response sheet

First submission writes the header: `submittedAt, familyCode, attentionPass,
respondentId, startedAt, totalMs`, then one column per question id, then
`_timeline`. Pivot by `familyCode` for the cross-member comparison (B.4).

> If you change the schema, the column layout changes — clear the `Responses`
> tab so the new header regenerates on the next submission.

## Develop / deploy

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # schema + randomization self-check
git push             # auto-deploys to Vercel production
```

Env var (Vercel): `SHEETS_WEBHOOK_URL` — the Apps Script `/exec` URL
(`google-apps-script.gs`). Treat it as a secret.

## Translations (i18n)

Five languages with an in-page switcher: **en** (source), **hi**, **mr**, **te**, **as**.
Built on `react-i18next`. English is canonical; any missing key falls back to English.

**Where strings live:** `locales/<lng>/survey.json`, flat keys namespaced by section:
`ui.*`, `consent.*`, `code.*`, `q.<id>.prompt`, `q.<id>.help`, `q.<id>.opt.<optionId>`.
`locales/en/survey.json` is the source of truth, **generated from the schema** by
`scripts/extract-i18n.ts`.

**Add / edit a string:** edit the text in `lib/schema.ts` (questions) or the `UI` block in
`scripts/extract-i18n.ts` (UI/system strings), then run
`node --experimental-strip-types scripts/extract-i18n.ts` to regenerate
`locales/en/survey.json` and refresh `NEEDS_NATIVE_REVIEW.md`. Add the same key with the
translated value to each `locales/<lng>/survey.json`.

**Add a language:** create `locales/<lng>/survey.json`, then register it in `lib/i18n.ts`
(`resources` + the `LANGS` switcher list, with the native endonym). Fonts: if it's a new
script, add the matching `next/font` face in `app/layout.tsx` and the CSS variable in the
`body` font stack.

**Do-not-translate brands:** `lib/glossary.ts`. Brand names (WhatsApp, Google Drive, UPI,
ABHA, 1mg, PharmEasy, …) are injected as protected `{{b_*}}` tokens that resolve to Latin
in every language, so translators can't alter them. Add a term in both `GLOSSARY` and
`BRAND_REPLACEMENTS`, then re-run the extractor. Indian city names and `₹` render verbatim.

**Language-neutral submission (data integrity):** the display label is translated, but what
gets **stored** is the stable option **id** (English canonical) — never the translated
label. So the same choice in Telugu and Marathi produces the identical stored value. The
respondent's display language is recorded separately in the `locale` column. Never key
analysis off the translated text.

**Native review:** `NEEDS_NATIVE_REVIEW.md` lists every key + English source. hi/mr/te/as
currently fall back to English; a native speaker must fill each key before go-live, keeping
meaning identical and leaving `{{b_*}}` tokens untouched.
