"use client";

import { useEffect, useMemo, useState } from "react";
import { Answers, Role, Question, CONSENT_TEXT, QBYID } from "@/lib/schema";
import { roleSections, sectionQuestions, visibleQuestions } from "@/lib/visibility";
import QuestionView from "./QuestionView";
import Progress from "./Progress";

type Phase = "consent" | "form" | "declined" | "done";
const LS_KEY = "fhs_state_v1";

interface Timeline { qid: string; atMs: number; pos?: number | number[]; }

function isAnswered(q: Question, answers: Answers): boolean {
  if (q.optional) return true;
  const v = answers[q.id];
  switch (q.type) {
    case "multi":
      return Array.isArray(v) && v.length > 0;
    case "matrix": {
      if (v?.cleared) return true;
      const rows = q.rows ?? [];
      const cells = v?.cells ?? {};
      return rows.length > 0 && rows.every((r) => cells[r.id]);
    }
    default:
      if (q.pipedPerStopped) {
        const cells = answers["Q10.1"]?.cells ?? {};
        const stopped = Object.entries(cells).filter(([, c]) => c === "stopped").map(([r]) => r);
        return stopped.every((rid) => v && v[rid]);
      }
      return v !== undefined && v !== null && v !== "";
  }
}

export default function Survey() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("consent");
  const [consentChoice, setConsentChoice] = useState<"agree" | "decline" | "">("");
  const [respondentId, setRespondentId] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const role: Role | undefined = (answers["Q0.4"] as Role) || undefined;
  const sections = useMemo(() => (role ? roleSections(role) : [0]), [role]);
  const total = role ? sections.length : roleSections("A").length;

  // ---- load / persist ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setPhase(s.phase ?? "consent");
        setRespondentId(s.respondentId ?? crypto.randomUUID());
        setStartedAt(s.startedAt ?? Date.now());
        setAnswers(s.answers ?? {});
        setTimeline(s.timeline ?? []);
        setStepIndex(s.stepIndex ?? 0);
        if (s.phase === "form") setConsentChoice("agree");
      } else {
        setRespondentId(crypto.randomUUID());
        setStartedAt(Date.now());
      }
    } catch {
      setRespondentId(crypto.randomUUID());
      setStartedAt(Date.now());
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const s = { phase, respondentId, startedAt, answers, timeline, stepIndex };
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
  }, [mounted, phase, respondentId, startedAt, answers, timeline, stepIndex]);

  const onChange = (qid: string, value: any, pos?: number | number[]) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setTimeline((t) => [...t.filter((e) => e.qid !== qid), { qid, atMs: Date.now() - startedAt, pos }]);
  };

  if (!mounted) return <div className="center spinner">Loading…</div>;

  // ---- consent ----
  if (phase === "consent") {
    return (
      <div>
        <div className="card">
          <h1>Managing the family&apos;s health</h1>
          <p className="lead">A short survey. Your answers are confidential.</p>
          <p className="consent-quote">{CONSENT_TEXT}</p>
          <label className={"opt" + (consentChoice === "agree" ? " sel" : "")}>
            <input type="radio" name="consent" checked={consentChoice === "agree"} onChange={() => setConsentChoice("agree")} />
            <span>I agree</span>
          </label>
          <label className={"opt" + (consentChoice === "decline" ? " sel" : "")}>
            <input type="radio" name="consent" checked={consentChoice === "decline"} onChange={() => setConsentChoice("decline")} />
            <span>I do not agree</span>
          </label>
          <div className="nav">
            <span />
            <button
              className="primary"
              disabled={!consentChoice}
              onClick={() => setPhase(consentChoice === "agree" ? "form" : "declined")}
            >
              Begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "declined") {
    return (
      <div className="card center">
        <h2>Thank you</h2>
        <p className="help">No answers have been recorded. You can close this page.</p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="card center">
        <h2>Thank you</h2>
        <p className="help">Your responses have been recorded.</p>
      </div>
    );
  }

  // ---- form ----
  const section = sections[Math.min(stepIndex, sections.length - 1)];
  const effectiveRole: Role = role ?? "A";
  const qs = sectionQuestions(effectiveRole, answers, section);
  const isLast = stepIndex >= sections.length - 1;
  const sectionValid = qs.every((q) => isAnswered(q, answers));

  const goNext = async () => {
    if (!sectionValid) {
      setShowErrors(true);
      const bad = qs.find((q) => !isAnswered(q, answers));
      if (bad) {
        // wait a frame so the error text is in the DOM, then scroll to it
        requestAnimationFrame(() =>
          document.getElementById(`q-${bad.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" })
        );
      }
      return;
    }
    setShowErrors(false);
    if (!isLast) { setStepIndex((i) => i + 1); window.scrollTo(0, 0); return; }
    await submit();
  };
  const goBack = () => { setShowErrors(false); setStepIndex((i) => Math.max(0, i - 1)); window.scrollTo(0, 0); };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    // keep only answers this role's form actually shows
    const keep = new Set(visibleQuestions(effectiveRole, answers).map((q) => q.id));
    const cleanAnswers: Answers = {};
    Object.keys(answers).forEach((k) => { if (keep.has(k)) cleanAnswers[k] = answers[k]; });
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          respondentId,
          role: effectiveRole,
          familyCode: answers["Q0.1"] ?? "",
          startedAt: new Date(startedAt).toISOString(),
          submittedAt: new Date().toISOString(),
          totalMs: Date.now() - startedAt,
          answers: cleanAnswers,
          timeline,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Submit failed");
      localStorage.removeItem(LS_KEY);
      setPhase("done");
    } catch (e: any) {
      setSubmitError(e?.message || "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Progress step={stepIndex + 1} total={total} />
      {qs.map((q) => (
        <QuestionView
          key={q.id}
          q={q}
          value={answers[q.id]}
          answers={answers}
          respondentId={respondentId}
          showError={showErrors && !isAnswered(q, answers)}
          onChange={onChange}
        />
      ))}
      {submitError && <p className="err">{submitError}</p>}
      <div className="nav">
        <button onClick={goBack} disabled={stepIndex === 0}>Back</button>
        <button className="primary" onClick={goNext} disabled={submitting}>
          {submitting ? "Submitting…" : isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

// referenced for typing only
void QBYID;
