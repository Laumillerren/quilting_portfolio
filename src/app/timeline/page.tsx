import Link from "next/link";
import { getAllProjects } from "@/lib/sheets";
import { buildTimeline } from "@/lib/timeline";
import type { QuiltProject } from "@/lib/types";

export const metadata = {
  title: "Timeline — Lorena's Quilt Archive",
};

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

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
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

export default async function TimelinePage() {
  const projects = await getAllProjects();
  const timeline = buildTimeline(projects);

  const finishedTotal = timeline.finishedByYear.reduce((sum, g) => sum + g.projects.length, 0);

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">Timeline</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--charcoal)]/60">
        What&rsquo;s been finished, what&rsquo;s underway, what&rsquo;s waiting, and what&rsquo;s next — {finishedTotal}{" "}
        quilts finished since {timeline.finishedByYear.at(-1)?.year ?? "—"}.
      </p>

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
      </div>
    </main>
  );
}
