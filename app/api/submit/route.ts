import { NextRequest, NextResponse } from "next/server";
import { QBYID, ALL_QIDS, Question } from "@/lib/schema";

export const runtime = "nodejs";

const META = ["submittedAt", "familyCode", "role", "respondentId", "startedAt", "totalMs"];
const HEADER = [...META, ...ALL_QIDS, "_timeline"];

const labelOf = (q: Question, id: string) =>
  q.options?.find((o) => o.id === id)?.label ?? id;

function formatAnswer(q: Question, value: any): string {
  if (value == null || value === "") return "";
  switch (q.type) {
    case "single":
    case "dropdown":
      return labelOf(q, value);
    case "multi":
      return (Array.isArray(value) ? value : []).map((id) => labelOf(q, id)).join(" | ");
    case "text":
      return String(value);
    case "matrix": {
      if (value.cleared) return q.options?.find((o) => o.clearsMatrix)?.label ?? "cleared";
      const cells: Record<string, string> = value.cells ?? {};
      return Object.entries(cells)
        .map(([rowId, colId]) => {
          const row = q.rows?.find((r) => r.id === rowId)?.label ?? rowId;
          const col = q.cols?.find((c) => c.id === colId)?.label ?? colId;
          return `${row}: ${col}`;
        })
        .join("; ");
    }
    default:
      return String(value);
  }
}

// Q10.2 is piped per stopped tool: value = { toolRowId: reasonOptionId }.
function formatPiped(value: any): string {
  if (!value || typeof value !== "object") return "";
  const q101 = QBYID["Q10.1"];
  const q102 = QBYID["Q10.2"];
  return Object.entries(value)
    .map(([rowId, reasonId]) => {
      const tool = q101.rows?.find((r) => r.id === rowId)?.label ?? rowId;
      const reason = q102.options?.find((o) => o.id === reasonId)?.label ?? String(reasonId);
      return `${tool} → ${reason}`;
    })
    .join("; ");
}

function toRow(body: any): string[] {
  const a = body.answers ?? {};
  const meta = [
    body.submittedAt ?? new Date().toISOString(),
    body.familyCode ?? a["Q0.1"] ?? "",
    body.role ?? "",
    body.respondentId ?? "",
    body.startedAt ?? "",
    String(body.totalMs ?? ""),
  ];
  const cells = ALL_QIDS.map((qid) => {
    const q = QBYID[qid];
    if (qid === "Q10.2" && q.pipedPerStopped) return formatPiped(a[qid]);
    return formatAnswer(q, a[qid]);
  });
  return [...meta, ...cells, JSON.stringify(body.timeline ?? [])];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.consent) return NextResponse.json({ error: "no consent" }, { status: 400 });

    const url = process.env.SHEETS_WEBHOOK_URL;
    if (!url) throw new Error("Missing SHEETS_WEBHOOK_URL");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ header: HEADER, row: toRow(body) }),
    });
    if (!res.ok) throw new Error(`Webhook returned ${res.status}`);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("submit error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "submit failed" }, { status: 500 });
  }
}
