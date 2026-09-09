"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import { Answers, Question, QUESTIONS, QBYID, ALL_QIDS } from "@/lib/schema";
import { normalizeCode } from "@/lib/codes";
import QuestionView from "./QuestionView";
import Progress from "./Progress";
import LanguageSwitcher from "./LanguageSwitcher";

type Phase = "consent" | "code" | "form" | "declined" | "done";
const LS_KEY = "fhs_state_v2";

interface Timeline { qid: string; atMs: number; pos?: number | number[]; }

const DEMO = ["age", "city", "gender", "relation"];
const SCREENS: string[][] = [DEMO, ...ALL_QIDS.filter((id) => !DEMO.includes(id)).map((id) => [id])];
const ATTN_INDEX = SCREENS.findIndex((s) => s.includes("attn"));

function isAnswered(q: Question, answers: Answers): boolean {
  if (q.optional) return true;
  const v = answers[q.id];
  if (q.type === "multi") return Array.isArray(v) && v.length > 0;
  return v !== undefined && v !== null && v !== "";
}

export default function Survey() {
  const { t, i18n } = useTranslation();
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
  const [floor, setFloor] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const total = SCREENS.length;

  useEffect(() => {
    try {
      const savedLng = localStorage.getItem("fhs_lng");
      if (savedLng && savedLng !== i18n.language) i18n.changeLanguage(savedLng);
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
  }, [i18n]);

  useEffect(() => {
    if (!mounted) return;
    const s = { phase, respondentId, startedAt, familyCode, answers, timeline, stepIndex, floor };
    try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
  }, [mounted, phase, respondentId, startedAt, familyCode, answers, timeline, stepIndex, floor]);

  const onChange = (qid: string, value: any, pos?: number | number[]) => {
    setAnswers((a) => ({ ...a, [qid]: value }));
    setTimeline((tl) => [...tl.filter((e) => e.qid !== qid), { qid, atMs: Date.now() - startedAt, pos }]);
  };

  const screenQuestions = useMemo(
    () => (SCREENS[Math.min(stepIndex, SCREENS.length - 1)] ?? []).map((id) => QBYID[id]),
    [stepIndex]
  );

  const shell = (body: ReactNode) => (
    <div>
      <LanguageSwitcher />
      {body}
    </div>
  );

  if (!mounted) return shell(<div className="center spinner">{t("ui.loading")}</div>);

  if (phase === "consent") {
    return shell(
      <div className="card">
        <h1>{t("consent.title")}</h1>
        <p className="lead">{t("consent.lead")}</p>
        <p className="consent-quote">{t("consent.text")}</p>
        <label className={"opt" + (consentChoice === "agree" ? " sel" : "")}>
          <input type="radio" name="consent" checked={consentChoice === "agree"} onChange={() => setConsentChoice("agree")} />
          <span>{t("consent.agree")}</span>
        </label>
        <label className={"opt" + (consentChoice === "decline" ? " sel" : "")}>
          <input type="radio" name="consent" checked={consentChoice === "decline"} onChange={() => setConsentChoice("decline")} />
          <span>{t("consent.decline")}</span>
        </label>
        <div className="nav">
          <span />
          <button className="primary" disabled={!consentChoice}
            onClick={() => setPhase(consentChoice === "agree" ? "code" : "declined")}>
            {t("consent.begin")}
          </button>
        </div>
      </div>
    );
  }

  if (phase === "code") {
    const submitCode = () => {
      const c = normalizeCode(codeInput);
      if (!c) { setCodeError(t("code.error")); return; }
      setFamilyCode(c);
      setCodeError("");
      setPhase("form");
    };
    return shell(
      <div className="card">
        <h2>{t("code.heading")}</h2>
        <p className="help">{t("code.help")}</p>
        <input type="text" value={codeInput}
          onChange={(e) => { setCodeInput(e.target.value); setCodeError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") submitCode(); }}
          placeholder={t("code.placeholder")} autoCapitalize="characters" aria-label="Family code" />
        {codeError && <p className="err">{codeError}</p>}
        <div className="nav">
          <button onClick={() => setPhase("consent")}>{t("ui.back")}</button>
          <button className="primary" disabled={!codeInput.trim()} onClick={submitCode}>{t("ui.continue")}</button>
        </div>
      </div>
    );
  }

  if (phase === "declined") {
    return shell(
      <div className="card center">
        <h2>{t("declined.title")}</h2>
        <p className="help">{t("declined.body")}</p>
      </div>
    );
  }

  if (phase === "done") {
    return shell(
      <div className="card center">
        <h2>{t("done.title")}</h2>
        <p className="help">{t("done.body")}</p>
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
          locale: i18n.language,
          attentionPass: answers["attn"] === QBYID["attn"].attention,
          startedAt: new Date(startedAt).toISOString(),
          submittedAt: new Date().toISOString(),
          totalMs: Date.now() - startedAt,
          answers,
          timeline,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      localStorage.removeItem(LS_KEY);
      setPhase("done");
    } catch {
      setSubmitError(t("ui.submit_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return shell(
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
        {backDisabled ? <span /> : <button onClick={goBack}>{t("ui.back")}</button>}
        <button className="primary" onClick={goNext} disabled={submitting}>
          {submitting ? t("ui.submitting") : isLast ? t("ui.submit") : t("ui.next")}
        </button>
      </div>
    </div>
  );
}

void QUESTIONS;
