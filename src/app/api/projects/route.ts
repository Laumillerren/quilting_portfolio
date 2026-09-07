import { slugify } from "@/lib/slugify";

/**
 * Appends a new project row to the Google Sheet.
 *
 * The public gviz endpoint used for reading is read-only, so writes go
 * through a small Google Apps Script Web App bound to the Sheet instead —
 * see scripts/apps-script-append-project.gs for the script and setup steps.
 * Both this route and the Apps Script check the same shared secret so an
 * unauthenticated request never reaches the Sheet.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password, ...fields } = body as Record<string, unknown>;

  if (!process.env.ADMIN_SECRET || password !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Incorrect password" }, { status: 401 });
  }

  const webAppUrl = process.env.SHEETS_WEBAPP_URL;
  if (!webAppUrl) {
    return Response.json(
      { error: "The sheet write endpoint isn't configured yet (SHEETS_WEBAPP_URL is missing)." },
      { status: 500 }
    );
  }

  const projectName = String(fields.project_name ?? "").trim();
  if (!projectName) {
    return Response.json({ error: "Project name is required" }, { status: 400 });
  }

  const slug = String(fields.slug ?? "").trim() || slugify(projectName);

  let upstream: Response;
  try {
    upstream = await fetch(webAppUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.ADMIN_SECRET,
        fields: { ...fields, project_name: projectName, slug },
      }),
    });
  } catch {
    return Response.json({ error: "Could not reach the sheet write endpoint" }, { status: 502 });
  }

  const text = await upstream.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return Response.json({ error: "Unexpected response from the sheet" }, { status: 502 });
  }

  const result = data as { ok?: boolean; error?: string };
  if (!upstream.ok || result.ok !== true) {
    return Response.json({ error: result.error ?? "Failed to write to the sheet" }, { status: 502 });
  }

  return Response.json({ ok: true, slug });
}
