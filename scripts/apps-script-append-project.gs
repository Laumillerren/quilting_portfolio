/**
 * Deploy target for the site's "add a project" admin form.
 *
 * Setup (one-time, done inside Google Sheets — not this repo):
 *   1. Open the Projects sheet -> Extensions -> Apps Script.
 *   2. Delete the placeholder code and paste this file's contents in.
 *   3. Project Settings (gear icon) -> Script Properties -> add ADMIN_SECRET
 *      with a secret value of your choosing.
 *   4. Deploy -> New deployment -> type "Web app".
 *      Execute as: Me. Who has access: Anyone.
 *   5. Authorize when prompted, then copy the Web app URL.
 *   6. Set that URL as SHEETS_WEBAPP_URL, and the same ADMIN_SECRET value,
 *      as environment variables on the site (Vercel + .env.local).
 *
 * Re-deploy (Deploy -> Manage deployments -> edit -> new version) any time
 * this file changes, since Apps Script Web Apps don't auto-update.
 */

const SHEET_NAME = "Projects";

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const expectedSecret = PropertiesService.getScriptProperties().getProperty("ADMIN_SECRET");

  if (!expectedSecret || payload.secret !== expectedSecret) {
    return jsonResponse({ ok: false, error: "Incorrect password" }, 401);
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ ok: false, error: `No sheet tab named "${SHEET_NAME}"` }, 500);
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((h) => String(h).trim().toLowerCase().replace(/\s+/g, "_"));

  const fields = payload.fields || {};

  const idColumn = headers.indexOf("id");
  if (idColumn !== -1 && !fields.id) {
    fields.id = String(sheet.getLastRow()); // header row is 1, so this is the count of existing data rows + 1
  }

  const row = headers.map((header) => {
    const value = fields[header];
    return value === undefined || value === null ? "" : value;
  });

  sheet.appendRow(row);

  return jsonResponse({ ok: true, slug: fields.slug });
}

function jsonResponse(body, status) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
