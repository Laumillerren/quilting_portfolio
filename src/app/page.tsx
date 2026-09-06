import QuiltArchiveScene from "@/components/scene/QuiltArchiveScene";
import { getAllProjects } from "@/lib/sheets";

export default async function Home() {
  const projects = await getAllProjects();

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-24 z-40 px-5 md:top-32 md:px-10">
        <p className="max-w-[15ch] font-serif text-[22px] italic leading-[1.25] text-[var(--charcoal)] md:max-w-[18ch] md:text-[28px]">
          A collection of quilts, patterns, fabrics, and projects made over time.
        </p>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-40 flex items-end justify-between px-5 md:bottom-8 md:px-10">
        <span className="font-serif text-[11px] italic text-[var(--charcoal)]/60 md:text-xs">
          Scroll to explore
        </span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--charcoal)]/50 md:text-[11px]">
          {projects.length} projects, 1994&ndash;present
        </span>
      </div>

      <main id="collection">
        <QuiltArchiveScene projects={projects} />
      </main>
    </>
  );
}
