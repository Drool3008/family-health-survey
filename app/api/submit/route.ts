import { NextRequest, NextResponse } from "next/server";
import { QBYID, ALL_QIDS, Question } from "@/lib/schema";
import { isEvaluatorCode } from "@/lib/codes";

export const runtime = "nodejs";

const META = ["submittedAt", "familyCode", "isEvaluator", "attentionPass", "respondentId", "startedAt", "totalMs"];
const HEADER = [...META, ...ALL_QIDS, "_timeline"];

const labelOf = (q: Question, id: string) =>
  q.options?.find((o) => o.id === id)?.label ?? id;

function formatAnswer(q: Question, value: any): string {
  if (value == null || value === "") return "";
  if (q.type === "multi") {
    return (Array.isArray(value) ? value : []).map((id) => labelOf(q, id)).join(" | ");
  }
  if (q.type === "single" || q.type === "dropdown") return labelOf(q, value);
  return String(value); // text
}

function toRow(body: any): string[] {
  const a = body.answers ?? {};
  const meta = [
    body.submittedAt ?? new Date().toISOString(),
    body.familyCode ?? "",
    isEvaluatorCode(body.familyCode ?? "") ? "EVAL" : "",
    body.attentionPass ? "PASS" : "FAIL",
    body.respondentId ?? "",
    body.startedAt ?? "",
    String(body.totalMs ?? ""),
  ];
  const cells = ALL_QIDS.map((qid) => formatAnswer(QBYID[qid], a[qid]));
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
