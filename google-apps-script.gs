// Paste this into your Google Sheet: Extensions > Apps Script (replace any code).
// Then: Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone
// Copy the Web app URL (ends in /exec) and give it to Claude / set SHEETS_WEBHOOK_URL.
//
// It writes to a tab named "Responses" (created if missing) and adds the header row once.

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName("Responses");
    if (!sh) sh = ss.insertSheet("Responses");

    if (sh.getLastRow() === 0 && body.header) {
      sh.appendRow(body.header);
    }
    sh.appendRow(body.row || []);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
