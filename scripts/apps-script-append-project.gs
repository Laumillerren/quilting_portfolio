/**
 * Deploy target for the site's admin "add / edit a project" forms.
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

// The id from the sheet's URL — opened explicitly (instead of
// SpreadsheetApp.getActiveSpreadsheet()) so this still works even if the
// script isn't bound to the sheet as a container script.
const SHEET_ID = "1QVGXhnL619-WDma8YTKsYEPSmeRaTuqOA0bLYAXarOQ";
const SHEET_NAME = "Projects";

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const expectedSecret = PropertiesService.getScriptProperties().getProperty("ADMIN_SECRET");

  if (!expectedSecret || payload.secret !== expectedSecret) {
    return jsonResponse({ ok: false, error: "Incorrect password" });
  }

  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) {
    return jsonResponse({ ok: false, error: `No sheet tab named "${SHEET_NAME}"` });
  }

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((h) => String(h).trim().toLowerCase().replace(/\s+/g, "_"));

  const fields = payload.fields || {};

  if (payload.action === "update") {
    return updateRow(sheet, headers, fields, payload.originalSlug);
  }
  return createRow(sheet, headers, fields);
}

function createRow(sheet, headers, fields) {
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

function updateRow(sheet, headers, fields, originalSlug) {
  const slugColumn = headers.indexOf("slug");
  if (slugColumn === -1) {
    return jsonResponse({ ok: false, error: 'No "slug" column found' });
  }

  const dataRowCount = Math.max(sheet.getLastRow() - 1, 0);
  const values = dataRowCount > 0 ? sheet.getRange(2, 1, dataRowCount, sheet.getLastColumn()).getValues() : [];

  const targetSlug = String(originalSlug || "").trim();
  const rowIndex = values.findIndex((row) => String(row[slugColumn]).trim() === targetSlug);

  if (rowIndex === -1) {
    return jsonResponse({ ok: false, error: `No project found with slug "${targetSlug}"` });
  }

  const existingRow = values[rowIndex];
  const newRow = headers.map((header, i) => {
    // Only overwrite columns the form actually manages — leave any other
    // column (a legacy field, something added directly in the sheet) as-is.
    if (!Object.prototype.hasOwnProperty.call(fields, header)) return existingRow[i];
    const value = fields[header];
    return value === undefined || value === null ? "" : value;
  });

  sheet.getRange(rowIndex + 2, 1, 1, newRow.length).setValues([newRow]);
  return jsonResponse({ ok: true, slug: fields.slug || targetSlug });
}

// Apps Script Web Apps sometimes fetch the /exec URL via GET as part of
// their own redirect handling, even for a client's POST request. Without a
// doGet defined at all, that hop crashes with "Failed" in the executions
// log — this just needs to exist and return something.
function doGet() {
  return jsonResponse({ ok: false, error: "This endpoint only accepts POST requests." });
}

function jsonResponse(body) {
  const output = ContentService.createTextOutput(JSON.stringify(body));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
