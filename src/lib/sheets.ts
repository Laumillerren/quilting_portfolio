import { mockProjects } from "./mockProjects";
import { placeholderFabric } from "./placeholderFabric";
import type { QuiltProject } from "./types";

/**
 * Data layer for quilt projects.
 *
 * Primary source: a public Google Sheet, one row per project, read via the
 * `gviz/tq` endpoint (no API key or service account needed — just publish
 * the sheet to the web, or share it as "Anyone with the link can view").
 *
 * Set these to point the site at Lorena's sheet:
 *   GOOGLE_SHEET_ID    - the id from the sheet's URL
 *   GOOGLE_SHEET_NAME   - the tab name (defaults to "Projects")
 *
 * Until those are set, or if the fetch fails, this falls back to local mock
 * data so the site (and its layout/interactions) can be developed and
 * previewed without any external dependency.
 */

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME ?? "Projects";

const EXPECTED_COLUMNS = [
  "id",
  "slug",
  "project_name",
  "status",
  "cover_image",
  "year",
  "date_started",
  "date_finished",
  "quilt_type",
  "dimensions",
  "pattern_name",
  "pattern_designer",
  "pattern_source",
  "pattern_link",
  "main_fabric",
  "fabric_brand",
  "fabric_designer",
  "fabric_collection",
  "batting",
  "backing",
  "binding",
  "techniques",
  "project_story",
  "notes",
  "lessons_learned",
  "photo_gallery",
  "featured",
  "block_template",
] as const;

type SheetRow = Record<(typeof EXPECTED_COLUMNS)[number], string>;

function splitList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,|\n]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function rowToProject(row: SheetRow, index: number): QuiltProject {
  const gallery = splitList(row.photo_gallery);
  const fallbackCover = placeholderFabric(row.id || row.slug || String(index));

  return {
    id: row.id || String(index),
    slug: row.slug || `project-${index}`,
    projectName: row.project_name || "Untitled Project",
    status: row.status || "Finished",
    coverImage: row.cover_image?.trim() || fallbackCover,
    year: row.year || "",
    dateStarted: row.date_started || undefined,
    dateFinished: row.date_finished || undefined,
    quiltType: row.quilt_type || undefined,
    dimensions: row.dimensions || undefined,
    patternName: row.pattern_name || undefined,
    patternDesigner: row.pattern_designer || undefined,
    patternSource: row.pattern_source || undefined,
    patternLink: row.pattern_link || undefined,
    mainFabric: row.main_fabric || undefined,
    fabricBrand: row.fabric_brand || undefined,
    fabricDesigner: row.fabric_designer || undefined,
    fabricCollection: row.fabric_collection || undefined,
    batting: row.batting || undefined,
    backing: row.backing || undefined,
    binding: row.binding || undefined,
    techniques: splitList(row.techniques),
    projectStory: row.project_story || undefined,
    notes: row.notes || undefined,
    lessonsLearned: row.lessons_learned || undefined,
    photoGallery: gallery.length > 0 ? gallery : [row.cover_image?.trim() || fallbackCover],
    featured: /^(true|yes|1)$/i.test(row.featured ?? ""),
  };
}

/** Parses the JSONP-wrapped response from Google's gviz/tq endpoint. */
function parseGviz(text: string): SheetRow[] {
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?\s*$/);
  if (!match) throw new Error("Unrecognized gviz response");
  const json = JSON.parse(match[1]);
  const cols: string[] = json.table.cols.map((c: { label?: string; id?: string }, i: number) => {
    const label = (c.label || "").trim().toLowerCase().replace(/\s+/g, "_");
    return label || EXPECTED_COLUMNS[i] || `col_${i}`;
  });
  const rows: { c: ({ v: unknown; f?: string } | null)[] }[] = json.table.rows;

  return rows.map((r) => {
    const record = {} as SheetRow;
    cols.forEach((col, i) => {
      const cell = r.c[i];
      // Prefer the formatted display string (`f`) over the raw value (`v`) —
      // Sheets returns dates as raw values like "Date(2023,2,1)", which only
      // `f` renders as the human-readable "March 2023".
      const value = cell?.f ?? cell?.v;
      (record as Record<string, string>)[col] = value === null || value === undefined ? "" : String(value);
    });
    return record;
  });
}

async function fetchFromSheet(): Promise<QuiltProject[] | null> {
  if (!SHEET_ID) return null;

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    SHEET_NAME
  )}`;

  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const text = await res.text();
    const rows = parseGviz(text);
    if (rows.length === 0) return null;
    return rows.map(rowToProject).filter((p) => p.slug && p.projectName);
  } catch {
    return null;
  }
}

export async function getAllProjects(): Promise<QuiltProject[]> {
  const fromSheet = await fetchFromSheet();
  return fromSheet ?? mockProjects;
}

export async function getProjectBySlug(slug: string): Promise<QuiltProject | undefined> {
  const projects = await getAllProjects();
  return projects.find((p) => p.slug === slug);
}

export async function getFeaturedProjects(): Promise<QuiltProject[]> {
  const projects = await getAllProjects();
  const featured = projects.filter((p) => p.featured);
  return featured.length > 0 ? featured : projects;
}
