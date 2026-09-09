import { slugify } from "@/lib/slugify";

/**
 * Creates or updates a project row in the Google Sheet.
 *
 * The public gviz endpoint used for reading is read-only, so writes go
 * through a small Google Apps Script Web App bound to the Sheet instead —
 * see scripts/apps-script-append-project.gs for the script and setup steps.
 * Both this route and the Apps Script check the same shared secret so an
 * unauthenticated request never reaches the Sheet.
 *
 * POST creates a new row. PUT updates an existing one, located by
 * `originalSlug` (the slug the row had when the edit form was loaded, so
 * renaming the slug itself still finds the right row).
 */

async function forwardToSheet(action: "create" | "update", fields: Record<string, unknown>, originalSlug?: string) {
  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) {
    throw new Error("The sheet write endpoint isn't configured yet (SHEETS_WEBAPP_URL is missing).");
  }

  const upstream = await fetch(webAppUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret: process.env.ADMIN_SECRET, action, originalSlug, fields }),
  });

  const text = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Unexpected response from the sheet");
  }

  const result = data as { ok?: boolean; error?: string; slug?: string };
  if (!upstream.ok || result.ok !== true) {
    throw new Error(result.error ?? "Failed to write to the sheet");
  }
  return result;
}

function checkPassword(body: Record<string, unknown>): Response | null {
  if (!process.env.ADMIN_SECRET || body.password !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const authError = checkPassword(body);
  if (authError) return authError;

  const { password: _password, ...fields } = body as Record<string, unknown>;

  const projectName = String(fields.project_name ?? "").trim();
  if (!projectName) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }
  const slug = String(fields.slug ?? "").trim() || slugify(projectName);

  try {
    await forwardToSheet("create", { ...fields, project_name: projectName, slug });
    return Response.json({ ok: true, slug });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed to write to the sheet" }, { status: 502 });
  }
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const authError = checkPassword(body);
  if (authError) return authError;

  const { password: _password, originalSlug, ...fields } = body as Record<string, unknown>;

  const originalSlugStr = String(originalSlug ?? "").trim();
  if (!originalSlugStr) {
    return Response.json({ error: "Missing the original project slug to update" }, { status: 400 });
  }

  const projectName = String(fields.project_name ?? "").trim();
  if (!projectName) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }
  const slug = String(fields.slug ?? "").trim() || originalSlugStr;

  try {
    await forwardToSheet("update", { ...fields, project_name: projectName, slug }, originalSlugStr);
    return Response.json({ ok: true, slug });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Failed to write to the sheet" }, { status: 502 });
  }
}
