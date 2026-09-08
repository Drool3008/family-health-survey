import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { QUESTIONS, QBYID, ALL_QIDS, Question } from "@/lib/schema";

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

function getSheets() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.consent) return NextResponse.json({ error: "no consent" }, { status: 400 });

    const sheetId = process.env.GOOGLE_SHEET_ID;
    if (!sheetId) throw new Error("Missing GOOGLE_SHEET_ID");
    const tab = process.env.GOOGLE_SHEET_TAB || "Responses";
    const sheets = getSheets();

    // Ensure the header row exists once.
    const head = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tab}!A1:A1`,
    });
    if (!head.data.values || head.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `${tab}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [HEADER] },
      });
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: `${tab}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [toRow(body)] },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("submit error:", e?.message || e);
    return NextResponse.json({ error: e?.message || "submit failed" }, { status: 500 });
  }
}

// touch imports so tree-shaking keeps them
void QUESTIONS;
