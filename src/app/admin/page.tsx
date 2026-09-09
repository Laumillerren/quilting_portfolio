import Link from "next/link";
import { getAllProjects } from "@/lib/sheets";

export const metadata = {
  title: "Admin — Lorena's Quilt Archive",
};

export default async function AdminIndexPage() {
  const projects = await getAllProjects();

  return (
    <main className="mx-auto max-w-2xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <div className="flex items-baseline justify-between">
        <h1 className="font-serif text-4xl italic leading-tight text-[var(--charcoal)] md:text-5xl">Admin</h1>
        <Link
          href="/admin/add"
          className="border border-[var(--charcoal)] px-4 py-2 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)] transition-colors hover:bg-[var(--charcoal)] hover:text-[var(--ivory)]"
        >
          + Add a Project
        </Link>
      </div>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--charcoal)]/60">
        Click any project below to edit it. Changes save straight to the Google Sheet.
      </p>

      <div className="mt-10">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/admin/edit/${p.slug}`}
            className="group flex items-baseline justify-between gap-4 border-b border-[var(--border)] py-3 transition-colors hover:border-[var(--charcoal)]/30"
          >
            <span className="min-w-0 flex-1">
              <span className="font-serif text-base italic text-[var(--charcoal)] group-hover:underline">
                {p.projectName}
              </span>
              <span className="ml-2 text-xs text-[var(--charcoal)]/45">{p.year}</span>
            </span>
            <span className="flex-shrink-0 text-[10px] uppercase tracking-[0.12em] text-[var(--charcoal)]/45">
              {p.status}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
