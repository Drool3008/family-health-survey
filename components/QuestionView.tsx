"use client";

import { useTranslation } from "react-i18next";
import { Question } from "@/lib/schema";
import { orderedOptions } from "@/lib/randomize";

interface Props {
  q: Question;
  value: any;
  respondentId: string;
  showError: boolean;
  onChange: (qid: string, value: any, pos?: number | number[]) => void;
}

export default function QuestionView({ q, value, respondentId, showError, onChange }: Props) {
  const { t } = useTranslation();
  const required = !q.optional;
  // City option labels are proper nouns — rendered verbatim, never translated.
  const optLabel = (oid: string, fallback: string) =>
    q.id === "city" ? fallback : t(`q.${q.id}.opt.${oid}`, { defaultValue: fallback });

  return (
    <div className="card" id={`q-${q.id}`}>
      <p className="qtitle">
        {t(`q.${q.id}.prompt`, { defaultValue: q.prompt })}
        {required && <span className="req" aria-hidden>*</span>}
      </p>
      {q.help && <p className="help">{t(`q.${q.id}.help`, { defaultValue: q.help })}</p>}

      {q.type === "single" && (
        <SingleView q={q} value={value} respondentId={respondentId} onChange={onChange} optLabel={optLabel} />
      )}

      {q.type === "multi" && (
        <MultiView q={q} value={value} respondentId={respondentId} onChange={onChange} optLabel={optLabel} />
      )}

      {q.type === "dropdown" && (
        <select
          value={value ?? ""}
          onChange={(e) => {
            const idx = (q.options ?? []).findIndex((o) => o.id === e.target.value);
            onChange(q.id, e.target.value || undefined, idx);
          }}
        >
          <option value="">{t("ui.select")}</option>
          {(q.options ?? []).map((o) => (
            <option key={o.id} value={o.id}>{optLabel(o.id, o.label)}</option>
          ))}
        </select>
      )}

      {q.type === "text" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          placeholder={q.optional ? t("ui.optional") : ""}
        />
      )}

      {showError && <p className="err">{t("ui.required_error")}</p>}
    </div>
  );
}

function SingleView({ q, value, respondentId, onChange, optLabel }: any) {
  const opts = orderedOptions(q, respondentId);
  return (
    <div role="radiogroup">
      {opts.map((o: any, i: number) => (
        <label key={o.id} className={"opt" + (value === o.id ? " sel" : "")}>
          <input type="radio" name={q.id} checked={value === o.id} onChange={() => onChange(q.id, o.id, i)} />
          <span>{optLabel(o.id, o.label)}</span>
        </label>
      ))}
    </div>
  );
}

function MultiView({ q, value, respondentId, onChange, optLabel }: any) {
  const opts = orderedOptions(q, respondentId);
  const arr: string[] = Array.isArray(value) ? value : [];
  const toggle = (id: string, i: number) => {
    const next = arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
    onChange(q.id, next, i);
  };
  return (
    <div>
      {opts.map((o: any, i: number) => (
        <label key={o.id} className={"opt" + (arr.includes(o.id) ? " sel" : "")}>
          <input type="checkbox" checked={arr.includes(o.id)} onChange={() => toggle(o.id, i)} />
          <span>{optLabel(o.id, o.label)}</span>
        </label>
      ))}
    </div>
  );
}
