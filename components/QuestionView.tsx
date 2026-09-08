"use client";

import { Question, Answers, QBYID } from "@/lib/schema";
import { orderedOptions } from "@/lib/randomize";
import MatrixView from "./MatrixView";

interface Props {
  q: Question;
  value: any;
  answers: Answers;
  respondentId: string;
  showError: boolean;
  onChange: (qid: string, value: any, pos?: number | number[]) => void;
}

export default function QuestionView({ q, value, answers, respondentId, showError, onChange }: Props) {
  const required = !q.optional;

  // Q14.2 pipes the chosen worst part from Q14.1 into its prompt.
  let prompt = q.prompt;
  if (q.pipeFrom) {
    const src = answers[q.pipeFrom];
    const srcQ = QBYID[q.pipeFrom];
    const lbl = src ? srcQ?.options?.find((o) => o.id === src)?.label : undefined;
    if (lbl) prompt = `${q.prompt} (You said the worst part was: "${lbl}".)`;
  }

  return (
    <div className="card">
      <p className="qtitle">
        {prompt}
        {required && <span className="req" aria-hidden>*</span>}
      </p>
      {q.help && <p className="help">{q.help}</p>}

      {q.type === "single" && !q.pipedPerStopped && (
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

      {q.type === "matrix" && !q.pipedPerStopped && (
        <MatrixView q={q} value={value} respondentId={respondentId} onChange={onChange} />
      )}

      {q.pipedPerStopped && (
        <PipedView q={q} value={value} answers={answers} respondentId={respondentId} onChange={onChange} />
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

// Q10.2 — one reason question per tool marked "tried and stopped" in Q10.1.
function PipedView({ q, value, answers, respondentId, onChange }: any) {
  const cells: Record<string, string> = answers["Q10.1"]?.cells ?? {};
  const stopped = Object.entries(cells).filter(([, c]) => c === "stopped").map(([r]) => r);
  const val: Record<string, string> = value && typeof value === "object" ? value : {};
  const rows = QBYID["Q10.1"].rows ?? [];
  const opts = orderedOptions(q, respondentId);

  if (stopped.length === 0) return <p className="help">No stopped tools to ask about.</p>;

  return (
    <div>
      {stopped.map((rid) => {
        const label = rows.find((r) => r.id === rid)?.label ?? rid;
        return (
          <div key={rid} style={{ marginBottom: 16 }}>
            <p className="help" style={{ fontWeight: 600, color: "var(--ink)" }}>{label}</p>
            {opts.map((o: any, i: number) => (
              <label key={o.id} className={"opt" + (val[rid] === o.id ? " sel" : "")}>
                <input
                  type="radio"
                  name={q.id + "_" + rid}
                  checked={val[rid] === o.id}
                  onChange={() => onChange(q.id, { ...val, [rid]: o.id }, i)}
                />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        );
      })}
    </div>
  );
}
