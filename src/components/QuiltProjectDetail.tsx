import Link from "next/link";
import SmartImage from "@/components/SmartImage";
import { resolveImageUrl } from "@/lib/imageUrl";
import type { QuiltProject } from "@/lib/types";

function InfoRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-6 border-b border-[var(--border)] py-2.5 text-[13px] md:text-sm">
      <dt className="text-[var(--charcoal)]/55">{label}</dt>
      <dd className="text-right text-[var(--charcoal)]">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[var(--border)] py-10 md:py-14">
      <h2 className="mb-5 font-serif text-lg italic text-[var(--charcoal)] md:mb-7 md:text-xl">{title}</h2>
      {children}
    </section>
  );
}

export default function QuiltProjectDetail({ project }: { project: QuiltProject }) {
  const hero = resolveImageUrl(project.coverImage);
  const gallery = project.photoGallery.map(resolveImageUrl).filter(Boolean);

  return (
    <article className="mx-auto max-w-4xl px-5 pb-32 pt-28 md:px-10 md:pt-36">
      <Link
        href="/"
        className="mb-10 inline-block text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)]/55 transition-colors hover:text-[var(--charcoal)] md:mb-14"
      >
        &larr; Back to the archive
      </Link>

      <header className="mb-10 md:mb-16">
        <h1 className="font-serif text-4xl italic leading-[1.05] text-[var(--charcoal)] md:text-6xl">
          {project.projectName}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-[11px] uppercase tracking-[0.14em] text-[var(--charcoal)]/60 md:text-xs">
          <span>{project.year}</span>
          <span>{project.status}</span>
        </div>
      </header>

      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--cream)] md:aspect-[16/10]">
        <SmartImage src={hero} alt={project.projectName} fill priority sizes="(max-width: 768px) 100vw, 900px" className="object-cover" />
      </div>

      <Section title="Project Information">
        <dl>
          <InfoRow label="Status" value={project.status} />
          <InfoRow label="Year" value={project.year} />
          <InfoRow label="Date Started" value={project.dateStarted} />
          <InfoRow label="Date Finished" value={project.dateFinished} />
          <InfoRow label="Quilt Type" value={project.quiltType} />
          <InfoRow label="Dimensions" value={project.dimensions} />
        </dl>
      </Section>

      {(project.patternName || project.patternDesigner || project.patternSource || project.patternLink) && (
        <Section title="Pattern">
          <dl>
            <InfoRow label="Pattern Name" value={project.patternName} />
            <InfoRow label="Pattern Designer" value={project.patternDesigner} />
            <InfoRow label="Pattern Source" value={project.patternSource} />
            {project.patternLink && (
              <div className="flex justify-between gap-6 border-b border-[var(--border)] py-2.5 text-[13px] md:text-sm">
                <dt className="text-[var(--charcoal)]/55">Pattern Link</dt>
                <dd>
                  <a
                    href={project.patternLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-right text-[var(--charcoal)] underline underline-offset-2"
                  >
                    View source
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </Section>
      )}

      <Section title="Fabrics &amp; Materials">
        <dl>
          <InfoRow label="Main Fabric" value={project.mainFabric} />
          <InfoRow label="Fabric Brand" value={project.fabricBrand} />
          <InfoRow label="Fabric Designer" value={project.fabricDesigner} />
          <InfoRow label="Fabric Collection" value={project.fabricCollection} />
          <InfoRow label="Batting" value={project.batting} />
          <InfoRow label="Backing" value={project.backing} />
          <InfoRow label="Binding" value={project.binding} />
        </dl>
      </Section>

      {project.techniques.length > 0 && (
        <Section title="Techniques">
          <div className="flex flex-wrap gap-2.5">
            {project.techniques.map((t) => (
              <span
                key={t}
                className="border border-[var(--border)] px-3 py-1.5 text-[11px] uppercase tracking-[0.1em] text-[var(--charcoal)]/75"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
      )}

      {(project.projectStory || project.notes || project.lessonsLearned) && (
        <Section title="Project Story">
          <div className="max-w-[62ch] space-y-5 font-serif text-[19px] italic leading-relaxed text-[var(--charcoal)]/90 md:text-[21px]">
            {project.projectStory && <p>{project.projectStory}</p>}
          </div>
          {(project.notes || project.lessonsLearned) && (
            <div className="mt-8 space-y-3 text-[13px] leading-relaxed text-[var(--charcoal)]/70 md:text-sm">
              {project.notes && (
                <p>
                  <span className="text-[var(--charcoal)]/50">Notes &mdash; </span>
                  {project.notes}
                </p>
              )}
              {project.lessonsLearned && (
                <p>
                  <span className="text-[var(--charcoal)]/50">Lessons learned &mdash; </span>
                  {project.lessonsLearned}
                </p>
              )}
            </div>
          )}
        </Section>
      )}

      {gallery.length > 0 && (
        <Section title="Photo Archive">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="relative aspect-[4/5] overflow-hidden bg-[var(--cream)]">
                <SmartImage
                  src={src}
                  alt={`${project.projectName} — detail ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 300px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}
