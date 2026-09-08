"use client";

import { useEffect, useMemo, useState } from "react";
import { Answers, Question, QUESTIONS, QBYID, ALL_QIDS, CONSENT_TEXT } from "@/lib/schema";
import { normalizeCode } from "@/lib/codes";
import QuestionView from "./QuestionView";
import Progress from "./Progress";

type Phase = "consent" | "code" | "form" | "declined" | "done";
const LS_KEY = "fhs_state_v2";

interface Timeline { qid: string; atMs: number; pos?: number | number[]; }

// One screen per question, except the three demographics share the first screen.
const DEMO = ["age", "city", "gender"];
const SCREENS: string[][] = [DEMO, ...ALL_QIDS.filter((id) => !DEMO.includes(id)).map((id) => [id])];
const ATTN_INDEX = SCREENS.findIndex((s) => s.includes("attn"));

function isAnswered(q: Question, answers: Answers): boolean {
  if (q.optional) return true;
  const v = answers[q.id];
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

export default function Survey() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("consent");
  const [consentChoice, setConsentChoice] = useState<"agree" | "decline" | "">("");
  const [respondentId, setRespondentId] = useState("");
  const [startedAt, setStartedAt] = useState<number>(0);
  const [familyCode, setFamilyCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [timeline, setTimeline] = useState<Timeline[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [floor, setFloor] = useState(0); // lowest step you can go back to (attention checkpoint)
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const total = SCREENS.length;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setPhase(s.phase ?? "consent");
        setRespondentId(s.respondentId ?? crypto.randomUUID());
        setStartedAt(s.startedAt ?? Date.now());
        setFamilyCode(s.familyCode ?? "");
        setCodeInput(s.familyCode ?? "");
        setAnswers(s.answers ?? {});
        setTimeline(s.timeline ?? []);
        setStepIndex(s.stepIndex ?? 0);
        setFloor(s.floor ?? 0);
        if (s.phase === "form" || s.phase === "code") setConsentChoice("agree");
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
    const s = { phase, respondentId, startedAt, familyCode, answers, timeline, stepIndex, floor };
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
  }, [mounted, phase, respondentId, startedAt, familyCode, answers, timeline, stepIndex, floor]);

  const onChange = (qid: string, value: any, pos?: number | number[]) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setTimeline((t) => [...t.filter((e) => e.qid !== qid), { qid, atMs: Date.now() - startedAt, pos }]);
  };

  const screenQuestions = useMemo(
    () => (SCREENS[Math.min(stepIndex, SCREENS.length - 1)] ?? []).map((id) => QBYID[id]),
    [stepIndex]
  );

  if (!mounted) return <div className="center spinner">Loading…</div>;

  if (phase === "consent") {
    return (
      <div className="card">
        <h1>Managing the family&apos;s health</h1>
        <p className="lead">A short survey, about 7–9 minutes. Your answers are confidential.</p>
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
          <button className="primary" disabled={!consentChoice}
            onClick={() => setPhase(consentChoice === "agree" ? "code" : "declined")}>
            Begin
          </button>
        </div>
      </div>
    );
  }

  if (phase === "code") {
    const submitCode = () => {
      const c = normalizeCode(codeInput);
      if (!c) { setCodeError("That code isn't recognised. Please check the code you were given."); return; }
      setFamilyCode(c);
      setCodeError("");
      setPhase("form");
    };
    return (
      <div className="card">
        <h2>Do you have a code?</h2>
        <p className="help">Enter the code you were given. It links your answers to the rest of your family. If you don&apos;t have one, please contact the person who sent you this.</p>
        <input type="text" value={codeInput}
          onChange={(e) => { setCodeInput(e.target.value); setCodeError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submitCode(); }}
          placeholder="e.g. MANGO47" autoCapitalize="characters" aria-label="Family code" />
        {codeError && <p className="err">{codeError}</p>}
        <div className="nav">
          <button onClick={() => setPhase("consent")}>Back</button>
          <button className="primary" disabled={!codeInput.trim()} onClick={submitCode}>Continue</button>
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
  const qs = screenQuestions;
  const isLast = stepIndex >= SCREENS.length - 1;
  const hideProgress = qs.some((q) => q.noProgress);
  const onAttn = stepIndex === ATTN_INDEX;
  const sectionValid = qs.every((q) => isAnswered(q, answers));

  const goNext = async () => {
    if (!sectionValid) {
      setShowErrors(true);
      const bad = qs.find((q) => !isAnswered(q, answers));
      if (bad) requestAnimationFrame(() =>
        document.getElementById(`q-${bad.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setShowErrors(false);
    // passing the attention check locks back-navigation across it
    if (onAttn) setFloor(ATTN_INDEX + 1);
    if (!isLast) { setStepIndex((i) => i + 1); window.scrollTo(0, 0); return; }
    await submit();
  };

  const backDisabled = stepIndex === 0 || onAttn || stepIndex <= floor;
  const goBack = () => {
    if (backDisabled) return;
    setShowErrors(false);
    setStepIndex((i) => Math.max(floor, i - 1));
    window.scrollTo(0, 0);
  };

  const submit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consent: true,
          respondentId,
          familyCode,
          attentionPass: answers["attn"] === QBYID["attn"].attention,
          startedAt: new Date(startedAt).toISOString(),
          submittedAt: new Date().toISOString(),
          totalMs: Date.now() - startedAt,
          answers,
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
      {!hideProgress && <Progress step={stepIndex + 1} total={total} />}
      {qs.map((q) => (
        <QuestionView
          key={q.id}
          q={q}
          value={answers[q.id]}
          respondentId={respondentId}
          showError={showErrors && !isAnswered(q, answers)}
          onChange={onChange}
        />
      ))}
      {submitError && <p className="err">{submitError}</p>}
      <div className="nav">
        {backDisabled ? <span /> : <button onClick={goBack}>Back</button>}
        <button className="primary" onClick={goNext} disabled={submitting}>
          {submitting ? "Submitting…" : isLast ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
}

void QUESTIONS;
