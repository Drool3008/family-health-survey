"use client";

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
  const required = !q.optional;

  return (
    <div className="card" id={`q-${q.id}`}>
      <p className="qtitle">
        {q.prompt}
        {required && <span className="req" aria-hidden>*</span>}
      </p>
      {q.help && <p className="help">{q.help}</p>}

      {q.type === "single" && (
        <SingleView q={q} value={value} respondentId={respondentId} onChange={onChange} />
      )}

      {q.type === "multi" && (
        <MultiView q={q} value={value} respondentId={respondentId} onChange={onChange} />
      )}

      {q.type === "dropdown" && (
        <select
          value={value ?? ""}
          onChange={(e) => {
            const idx = (q.options ?? []).findIndex((o) => o.id === e.target.value);
            onChange(q.id, e.target.value || undefined, idx);
          }}
        >
          <option value="">Select…</option>
          {(q.options ?? []).map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </select>
      )}

      {q.type === "text" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(q.id, e.target.value)}
          placeholder={q.optional ? "Optional" : ""}
        />
      )}

      {showError && <p className="err">Please answer this before continuing.</p>}
    </div>
  );
}

function SingleView({ q, value, respondentId, onChange }: any) {
  const opts = orderedOptions(q, respondentId);
  return (
    <div role="radiogroup">
      {opts.map((o: any, i: number) => (
        <label key={o.id} className={"opt" + (value === o.id ? " sel" : "")}>
          <input type="radio" name={q.id} checked={value === o.id} onChange={() => onChange(q.id, o.id, i)} />
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}

function MultiView({ q, value, respondentId, onChange }: any) {
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
          <span>{o.label}</span>
        </label>
      ))}
    </div>
  );
}
