"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buildTimeline } from "@/lib/timeline";
import type { QuiltProject } from "@/lib/types";

function ProjectRow({ project }: { project: QuiltProject }) {
  return (
    <Link
      href={`/quilts/${project.slug}`}
      className="group flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-3 transition-colors hover:border-[var(--charcoal)]/30"
    >
      <span className="min-w-0 flex-1">
        <span className="font-serif text-base italic text-[var(--charcoal)] group-hover:underline">
          {project.projectName}
        </span>
        {project.quiltType && <span className="ml-2 text-xs text-[var(--charcoal)]/45">{project.quiltType}</span>}
      </span>
      <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--charcoal)]/45">
        {project.status}
      </span>
    </Link>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <section className="mb-14">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-serif text-xl italic text-[var(--charcoal)]">{title}</h2>
        <span className="text-xs text-[var(--charcoal)]/45">{count}</span>
      </div>
      <div>{children}</div>
    </section>
  );
}

function uniqueTechniques(projects: QuiltProject[]): string[] {
  const seen = new Map<string, string>();
  for (const p of projects) {
    for (const t of p.techniques) {
      const key = t.toLowerCase();
      if (!seen.has(key)) seen.set(key, t);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export default function TimelineView({ projects }: { projects: QuiltProject[] }) {
  const [technique, setTechnique] = useState<string | null>(null);
  const techniques = useMemo(() => uniqueTechniques(projects), [projects]);

  const filtered = useMemo(() => {
    if (!technique) return projects;
    return projects.filter((p) => p.techniques.some((t) => t.toLowerCase() === technique.toLowerCase()));
  }, [projects, technique]);

  const timeline = useMemo(() => buildTimeline(filtered), [filtered]);

  return (
    <>
      {techniques.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTechnique(null)}
            className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
              technique === null
                ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-[var(--ivory)]"
                : "border-[var(--border)] text-[var(--charcoal)]/75 hover:border-[var(--charcoal)]/40"
            }`}
          >
            All
          </button>
          {techniques.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTechnique(t)}
              className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                technique === t
                  ? "border-[var(--charcoal)] bg-[var(--charcoal)] text-[var(--ivory)]"
                  : "border-[var(--border)] text-[var(--charcoal)]/75 hover:border-[var(--charcoal)]/40"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-14">
        <Section title="This Year's Goals" count={timeline.planned.length}>
          {timeline.planned.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </Section>

        <Section title="In Progress" count={timeline.inProgress.length}>
          {timeline.inProgress.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </Section>

        <Section title="UFOs" count={timeline.ufos.length}>
          {timeline.ufos.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </Section>

        {timeline.finishedByYear.map((group) => (
          <Section key={group.year} title={group.year} count={group.projects.length}>
            {group.projects.map((p) => (
              <ProjectRow key={p.id} project={p} />
            ))}
          </Section>
        ))}

        {technique &&
          timeline.planned.length === 0 &&
          timeline.inProgress.length === 0 &&
          timeline.ufos.length === 0 &&
          timeline.finishedByYear.length === 0 && (
            <p className="text-sm text-[var(--charcoal)]/50">No projects use {technique}.</p>
          )}
      </div>
    </>
  );
}
