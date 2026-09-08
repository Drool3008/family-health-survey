"use client";

import { Question } from "@/lib/schema";
import { orderedRows } from "@/lib/randomize";

interface Props {
  q: Question;
  value: any; // { cleared?: boolean, cells: Record<rowId,colId> }
  respondentId: string;
  onChange: (qid: string, value: any, pos?: number) => void;
}

export default function MatrixView({ q, value, respondentId, onChange }: Props) {
  const rows = orderedRows(q, respondentId);
  const cols = q.cols ?? [];
  const cleared: boolean = value?.cleared ?? false;
  const cells: Record<string, string> = value?.cells ?? {};
  const clearOpt = q.options?.find((o) => o.clearsMatrix);

  const setCell = (rowId: string, colId: string, colIdx: number) => {
    onChange(q.id, { cleared: false, cells: { ...cells, [rowId]: colId } }, colIdx);
  };
  const toggleClear = () => {
    onChange(q.id, cleared ? { cleared: false, cells: {} } : { cleared: true, cells: {} });
  };

  return (
    <div>
      <div className="matrix">
        <table>
          <thead>
            <tr>
              <th></th>
              {cols.map((c) => <th key={c.id}>{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cleared ? "disabled" : ""}>
                <td>{r.label}</td>
                {cols.map((c, ci) => (
                  <td key={c.id}>
                    <input
                      type="radio"
                      name={q.id + "_" + r.id}
                      disabled={cleared}
                      checked={cells[r.id] === c.id}
                      onChange={() => setCell(r.id, c.id, ci)}
                      aria-label={`${r.label}: ${c.label}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {clearOpt && (
        <label className={"opt" + (cleared ? " sel" : "")} style={{ marginTop: 12 }}>
          <input type="checkbox" checked={cleared} onChange={toggleClear} />
          <span>{clearOpt.label}</span>
        </label>
      )}
    </div>
  );
}
