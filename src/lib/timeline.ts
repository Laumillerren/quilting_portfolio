import type { QuiltProject } from "./types";

export interface YearGroup {
  year: string;
  projects: QuiltProject[];
}

export interface ProjectTimeline {
  /** Status contains "plan", "want", "goal", or "wish" — not yet started. */
  planned: QuiltProject[];
  /** Status contains "progress" — actively being worked on. */
  inProgress: QuiltProject[];
  /** Status contains "ufo" — started, set aside, not touched in a while. */
  ufos: QuiltProject[];
  /** Everything else (Finished, Gifted, Sold, ...), grouped by finish year, newest first. */
  finishedByYear: YearGroup[];
}

function extractYear(project: QuiltProject): string {
  const fromFinished = project.dateFinished?.match(/\d{4}/)?.[0];
  if (fromFinished) return fromFinished;
  const fromYear = project.year?.match(/\d{4}/)?.[0];
  return fromYear ?? "Undated";
}

/** Buckets projects by status into planning/active/dormant/finished, the last grouped by year. */
export function buildTimeline(projects: QuiltProject[]): ProjectTimeline {
  const planned: QuiltProject[] = [];
  const inProgress: QuiltProject[] = [];
  const ufos: QuiltProject[] = [];
  const finished: QuiltProject[] = [];

  for (const project of projects) {
    const status = project.status.toLowerCase();
    if (/ufo/.test(status)) {
      ufos.push(project);
    } else if (/progress/.test(status)) {
      inProgress.push(project);
    } else if (/plan|want|goal|wish/.test(status)) {
      planned.push(project);
    } else {
      finished.push(project);
    }
  }

  const byYear = new Map<string, QuiltProject[]>();
  for (const project of finished) {
    const year = extractYear(project);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(project);
  }

  const finishedByYear: YearGroup[] = Array.from(byYear.entries())
    .sort(([a], [b]) => (a === "Undated" ? 1 : b === "Undated" ? -1 : Number(b) - Number(a)))
    .map(([year, yearProjects]) => ({ year, projects: yearProjects }));

  return { planned, inProgress, ufos, finishedByYear };
}
