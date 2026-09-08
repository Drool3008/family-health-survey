# Family Health Coordination Survey

Self-hosted web form for *The Ken Case Competition 2026*. Built from
`family-health-survey(1).md`. Next.js (App Router) + one API route that appends
each submission to a Google Sheet.

## What it implements (per the spec's build notes)

- **Q0.4 routes to four distinct forms** (Roles A/B/C/D). Role D never renders A/B/C questions.
- **Trigger rules T1–T9** and the **exempt list** (A.4). Exempt questions are never skipped.
- **[RANDOMISE]** option order, with `Other / None / Don't know` pinned last (A.1.4). Matrix rows randomized (Q2.7) / within groups (Q10.1).
- **Forced response** on every non-optional question; only Q14.5 is optional.
- **Step-based progress** ("Part X of Y", never a percentage); the denominator is fixed per role so it doesn't shrink on a "Nobody/Never" answer.
- **78-question cap** with the A.5 drop order (Q6.2 → Q3.7 → Q5.3 → Q13.2 → Q4.1).
- **Save & resume** via browser `localStorage`, keyed to a per-respondent id (same device).
- **`time_on_question`** captured client-side (with the displayed option position, needed for the D.3 straight-lining check) and stored with each submission.

### Deviations from the literal spec (confirmed decisions)

- **T5** (Q6.7) is a forward reference in the spec (it reads Q10.1, asked later). Gated instead on **Q6.5** (online / quick-delivery selected), the in-order equivalent.
- **Save/resume** uses `localStorage` (same device); the spec's "family code + email" key isn't possible because no email is collected before the optional end field.
- **Timing** is logged at submit time (stored server-side in the sheet), not streamed per keystroke.

See `family-health-survey(1).md` Parts A and D.3 for the source rules.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the Google values
npm run dev                  # http://localhost:3000
```

Without Google credentials the form runs, but submit will 500. To test the flow
without a sheet, temporarily point `app/api/submit/route.ts` at a console log.

## Google Sheets setup (one time)

1. Create a Google Cloud project. Enable the **Google Sheets API**.
2. Create a **Service Account**; under Keys, add a **JSON key** and download it.
3. Create a Google Sheet. Copy its ID from the URL (`/d/<THIS>/edit`). Add a tab named `Responses` (or set `GOOGLE_SHEET_TAB`).
4. **Share the sheet** with the service account's `client_email` (Editor).
5. From the JSON key, set env vars:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` = `client_email`
   - `GOOGLE_PRIVATE_KEY` = `private_key` (keep the `\n` sequences; wrap in quotes)
   - `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB`

The header row is written automatically on the first submission: meta columns
(`submittedAt, familyCode, role, respondentId, startedAt, totalMs`), then one
column per question id, then `_timeline`. Pivot by `familyCode` for the D.4
cross-member contradiction analysis.

## Deploy to Vercel

```bash
npm i -g vercel      # if needed
vercel               # first deploy (links project)
```

Then in the Vercel dashboard (Project → Settings → Environment Variables) add the
four `GOOGLE_*` vars, and redeploy:

```bash
vercel --prod
```

Send each family member the deployed URL plus their family code (F1–F5). Q0.4
self-routes them to the right form.
