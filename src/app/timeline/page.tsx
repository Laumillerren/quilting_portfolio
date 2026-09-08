import TimelineView from "@/components/timeline/TimelineView";
import { getAllProjects } from "@/lib/sheets";
import { buildTimeline } from "@/lib/timeline";

export const metadata = {
  title: "Timeline — Lorena's Quilt Archive",
};

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

      <TimelineView projects={projects} />
    </main>
  );
}
